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
- Technical jargon that has little use outside a specialized field
- Hyphenated expressions or compound phrases unless they are widely recognized advanced vocabulary terms
- Words whose difficulty depends only on the passage context rather than general vocabulary value

For each word, return an object with:

- word: the base form of the word
- definition: a clear, concise definition written for a test-prep student
- contextSentence: a short, simple, easy-to-understand example sentence that YOU create
- synonyms: exactly 3 relevant synonyms
- difficulty: "easy", "medium", or "hard"
- partOfSpeech: "noun", "verb", "adjective", or "adverb"

STRICT RULES:
- Extract only the most useful 10-12 vocabulary words from the passage
- Prefer single-word vocabulary items
- NEVER copy, quote, or reuse a sentence from the passage
- contextSentence must always be newly generated
- contextSentence should be short, natural, and easy to understand
- Avoid academic, complex, or lengthy example sentences
- Definitions should be accurate but simple
- Synonyms should closely match the word's meaning
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