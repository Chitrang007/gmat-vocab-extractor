package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Chitrang007/gmat-vocab-extractor/backend/models" 
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SavePassage(client *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p models.Passage
		
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		collection := client.Database("vocabdb").Collection("passages")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		var existing models.Passage
		err := collection.FindOne(ctx, bson.M{"text": p.Text}).Decode(&existing)
		if err == nil {
			http.Error(w, "Passage already exists", http.StatusConflict)
			return
		} else if err != mongo.ErrNoDocuments {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		p.CreatedAt = time.Now()
		result, err := collection.InsertOne(ctx, p)
		if err != nil {
			http.Error(w, "Failed to save passage", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(result)
	}
}