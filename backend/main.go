package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Chitrang007/gmat-vocab-extractor/backend/handlers"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

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

	handler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Content-Type"},
	}).Handler(mux)

	log.Println("Server running on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}