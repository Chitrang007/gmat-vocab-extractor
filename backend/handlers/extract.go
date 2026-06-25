package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Chitrang007/gmat-vocab-extractor/backend/models"
)

type extractRequest struct {
	Passage string `json:"passage"`
}

type geminiRequest struct {
	SystemInstruction struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"system_instruction"`
	Contents []struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"contents"`
	GenerationConfig struct {
		Temperature float64 `json:"temperature"`
	} `json:"generation_config"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func ExtractWords(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req extractRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Passage == "" {
		log.Println("Bad Request:", err)
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	log.Println("Received passage, calling Gemini...")

	words, err := callGemini(req.Passage)
	if err != nil {
		log.Println("Gemini error:", err)
		http.Error(w, "gemini error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Got words From Gemini:", len(words))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(words)
}

func callGemini(passage string) ([]models.Word, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	url := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=%s",
		apiKey,
	)

	systemPrompt := `You are a vocabulary extraction assistant for a GMAT reading comprehension learning app.

Your task is to identify 10-12 of the most valuable vocabulary words from the passage for GMAT, GRE, and advanced academic reading comprehension preparation.

Prioritize words that:
- Are useful across many contexts and topics
- Frequently appear in academic, analytical, scientific, economic, historical, or business writing
- Help improve reading comprehension and test-prep vocabulary
- Are meaningfully challenging for an advanced undergraduate student

Do NOT extract:
- Proper nouns (names, places, brands, organizations)
- Very common everyday words
- Technical jargon that has little use outside a specialized field (unless commonly seen in academic/GMAT-style texts)
- Hyphenated expressions or compound phrases unless they are widely recognized vocabulary terms
- Words whose difficulty depends only on the passage context rather than general vocabulary value

For each word, return an object with:

- word: base form (lemma)
- definition: clear, concise test-prep definition
- contextSentence: a simple sentence YOU generate (NOT from the passage)
- synonyms: exactly 4 dictionary-accurate synonyms (single words preferred)
- antonyms: exactly 4 true lexical antonyms (single words preferred)

- acceptedAnswers: 6-8 correct answers for grading user responses (meanings, synonyms, paraphrases)
- nearMissAnswers: 6-8 close-but-incorrect answers (plausible mistakes or partial matches)

- rootInfo:
  - root: base root (if applicable, otherwise empty string)
  - meaning: meaning of root
  - prefixes: list of prefixes (if any)
  - suffixes: list of suffixes (if any)
  - breakdown: short explanation of word formation (simple, student-friendly)

- difficulty: "easy", "medium", or "hard"
- partOfSpeech: "noun", "verb", "adjective", or "adverb"

STRICT RULES:
- Extract only the most useful 10-12 vocabulary words from the passage
- Prefer single-word vocabulary items
- No duplicate words or near-duplicate root meanings across the list
- Return words in lemma/base form (e.g., "analyze", not "analyzing")
- Difficulty must reflect general academic frequency, not passage-specific confusion
- NEVER copy or reuse sentences from the passage
- contextSentence must be newly generated, simple, and natural
- Definitions must be accurate and test-prep friendly

- Synonyms must be true replacements, not thematic associations
- Antonyms must be true lexical opposites; avoid forced or contextual opposites
- If valid antonyms do not exist, return fewer (minimum 2 acceptable, do not force 4)

- acceptedAnswers must include meanings AND close synonyms suitable for grading
- nearMissAnswers must include plausible student mistakes or partial matches
- Do not overlap acceptedAnswers and nearMissAnswers

- rootInfo must be OPTIONAL LOGICALLY (if no root exists, return empty strings and empty arrays)

- All fields must be present for every word object (use empty arrays or empty strings where needed)
- Ensure output is valid JSON that can be parsed without preprocessing
- Do not include extra keys outside the schema
- Output ONLY a valid JSON array
- No markdown
- No explanations
- No introductory text
- No trailing comments`

	userPrompt := fmt.Sprintf(`Extract vocabulary words from the passage.

Return format:
[{"word":"","definition":"","contextSentence":"","synonyms":[],"difficulty":"","partOfSpeech":""}]

Passage:
"""
%s
"""`, passage)

	reqBody := map[string]interface{}{
		"system_instruction": map[string]interface{}{
			"parts": []map[string]string{{"text": systemPrompt}},
		},
		"contents": []map[string]interface{}{
			{"parts": []map[string]string{{"text": userPrompt}}},
		},
		"generation_config": map[string]interface{}{
			"temperature": 0.2,
		},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 45 * time.Second}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini api error: %s", string(respBytes))
	}

	var gemResp geminiResponse
	if err := json.Unmarshal(respBytes, &gemResp); err != nil {
		return nil, err
	}

	if len(gemResp.Candidates) == 0 ||
		len(gemResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("invalid gemini response structure")
	}

	raw := strings.TrimSpace(gemResp.Candidates[0].Content.Parts[0].Text)
	raw = strings.Trim(raw, "`")
	raw = strings.TrimPrefix(raw, "json")
	raw = strings.TrimSpace(raw)

	var words []models.Word
	if err := json.Unmarshal([]byte(raw), &words); err != nil {
		return nil, fmt.Errorf("failed to parse gemini response: %s", raw)
	}

	return words, nil
}