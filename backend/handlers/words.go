package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"github.com/Chitrang007/gmat-vocab-extractor/backend/db"
	"github.com/Chitrang007/gmat-vocab-extractor/backend/models"
)

func SaveWord(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var word models.Word
	if err := json.NewDecoder(r.Body).Decode(&word); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	collection := db.GetCollection("words")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, word)
	if err != nil {
		http.Error(w, "failed to save word: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "word saved successfully"})
}

func GetWords(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	collection := db.GetCollection("words")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		http.Error(w, "failed to fetch words: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var words []models.Word
	if err = cursor.All(ctx, &words); err != nil {
		http.Error(w, "failed to decode words: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(words)
}

func GetQuiz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	collection := db.GetCollection("words")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		http.Error(w, "failed to fetch words: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var words []models.Word
	if err = cursor.All(ctx, &words); err != nil {
		http.Error(w, "failed to decode words: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(words) < 4 {
		http.Error(w, "need at least 4 saved words to start quiz", http.StatusBadRequest)
		return
	}

	var questions []map[string]interface{}
	for i, word := range words {
		distractors := []string{}
		for j, w := range words {
			if j != i {
				distractors = append(distractors, w.Word)
			}
			if len(distractors) == 3 {
				break
			}
		}

		options := append(distractors, word.Word)
		// shuffle options
		for k := len(options) - 1; k > 0; k-- {
			j := k / 2
			options[k], options[j] = options[j], options[k]
		}

		blank := word.ContextSentence
		lower := strings.ToLower(word.ContextSentence)
		wordLower := strings.ToLower(word.Word)
		idx := strings.Index(lower, wordLower)
		if idx != -1 {
			blank = word.ContextSentence[:idx] + "_______" + word.ContextSentence[idx+len(word.Word):]
		}

		questions = append(questions, map[string]interface{}{
			"sentence": blank,
			"answer":   word.Word,
			"options":  options,
			"definition": word.Definition,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}