package handlers

import (
	"context"
	"encoding/json"
	"net/http"
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