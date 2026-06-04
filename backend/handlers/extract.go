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

- word: the base form (lemma) of the word
- definition: a clear, concise definition written for a test-prep student
- contextSentence: a short, simple, easy-to-understand sentence that YOU generate (must not be from the passage)
- synonyms: 4 relevant synonyms
- antonyms: 4 relevant antonyms
- difficulty: "easy", "medium", or "hard"
- partOfSpeech: "noun", "verb", "adjective", or "adverb"

STRICT RULES:
- Extract only the most useful 10-12 vocabulary words from the passage
- Prefer single-word vocabulary items
- Do not include duplicate words or words with identical root meaning across the final list
- Do not include multiple words that are simple morphological variants unless they have distinct meanings
- Return words in their lemma/base form (e.g., "analyze", not "analyzing")
- Difficulty should reflect general academic vocabulary frequency and familiarity, not passage-specific difficulty
- Do not select words solely because they have good antonyms; vocabulary value is the primary priority
- NEVER copy, quote, or reuse a sentence from the passage
- contextSentence must always be newly generated, short, natural, and easy to understand
- Avoid complex, academic, or long example sentences
- Definitions should be simple but accurate for test preparation
- Synonyms should closely match the meaning of the word
- Synonyms must be direct, dictionary-accurate replacements in most contexts, not loosely related concepts or theme-based associations.
- Antonyms must be true lexical opposites (not contextual or situational opposites)
- Do not generate antonyms that are loosely related or merely contextual differences
- Prefer commonly accepted antonyms used in standard academic English
- If a true antonym is not available, return fewer antonyms rather than forcing incorrect ones
- Synonyms and antonyms must not overlap or contradict each other within the same word entry
- Synonyms and antonyms should be single words unless no valid single-word option exists
- All fields must be present for every word object; never omit fields or return null
- Ensure output is valid JSON that can be parsed without preprocessing
- Do not include extra keys outside the defined schema
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