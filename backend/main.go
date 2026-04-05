package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"io"

	"github.com/Chitrang007/gmat-vocab-extractor/backend/db"
	"github.com/Chitrang007/gmat-vocab-extractor/backend/handlers"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db.Connect()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"status": "ok"}`)
	})

	mux.HandleFunc("/extract-words", handlers.ExtractWords)
	mux.HandleFunc("/save-word", handlers.SaveWord)
	mux.HandleFunc("/get-words", handlers.GetWords)
	mux.HandleFunc("/quiz", handlers.GetQuiz)

	mux.HandleFunc("/list-models", func(w http.ResponseWriter, r *http.Request) {
		apiKey := os.Getenv("GEMINI_API_KEY")
		resp, err := http.Get("https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		defer resp.Body.Close()
		io.Copy(w, resp.Body)
	})

	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Content-Type"},
	}).Handler(mux)

	log.Println("Server running on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}