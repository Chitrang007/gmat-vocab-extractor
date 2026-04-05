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
Your job is to identify words in a passage that are likely unfamiliar to an advanced undergraduate student.

Do NOT extract:
- Proper nouns (names, places, brands)
- Common words (the, and, because, large, small)
- Technical jargon with no general usage

Always return a valid JSON array. No markdown, no explanation, no preamble.
Return exactly the JSON — nothing before it, nothing after it.`

	userPrompt := fmt.Sprintf(`Extract 5-8 vocabulary words from the passage below.

For each word return:
- word: the base form (e.g. "exacerbate" not "exacerbated")
- definition: one clear sentence written for a test-prep student
- contextSentence: the exact sentence from the passage where the word appears
- synonyms: array of 3 related words
- difficulty: one of "easy", "medium", "hard"
- partOfSpeech: "noun", "verb", "adjective", or "adverb"

Return format example:
[{"word":"exacerbate","definition":"To make a problem worse.","contextSentence":"The drought exacerbated food shortages.","synonyms":["worsen","aggravate","intensify"],"difficulty":"hard","partOfSpeech":"verb"}]

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
			"temperature": 0.3,
		},
	}

	bodyBytes, _ := json.Marshal(reqBody)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	log.Println("Gemini raw response:", string(respBytes))

	var gemResp geminiResponse
	if err := json.Unmarshal(respBytes, &gemResp); err != nil {
		return nil, err
	}

	if len(gemResp.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates returned from gemini")
	}

	raw := gemResp.Candidates[0].Content.Parts[0].Text
	raw = strings.TrimSpace(raw)
	raw = strings.TrimPrefix(raw, "```json")
	raw = strings.TrimPrefix(raw, "```")
	raw = strings.TrimSuffix(raw, "```")
	raw = strings.TrimSpace(raw)

	var words []models.Word
	if err := json.Unmarshal([]byte(raw), &words); err != nil {
		return nil, fmt.Errorf("failed to parse gemini response: %s", raw)
	}

	return words, nil
}