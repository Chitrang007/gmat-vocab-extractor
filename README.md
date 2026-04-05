# Vocabrium

A context-based vocabulary learning platform that extracts difficult words from reading passages and helps users learn them the way they naturally appear — in context, not in isolation.

Built for GMAT/GRE reading comprehension prep.

**Live:** [vocabrium.vercel.app](https://vocabrium.vercel.app)

---

## What it does

Paste any reading comprehension passage. Vocabrium identifies advanced vocabulary, pulls definitions, synonyms, difficulty ratings, and the exact sentence where the word appeared. Save words to your personal bank and test yourself with GMAT-style fill-in-the-blank quizzes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Go (net/http) |
| AI | Google Gemini 2.5 Flash |
| Database | MongoDB Atlas |
| Hosting | Vercel (frontend), Render (backend) |

---

## Features

- **Passage extraction** — paste any paragraph, get 5–8 difficult words with definitions, context sentences, synonyms, and difficulty tags
- **Word bank** — personal vocabulary dictionary that persists across sessions
- **Pronunciation** — click the speaker icon on any word to hear it spoken
- **Quiz mode** — fill-in-the-blank questions using your saved words and their original context sentences
- **Duplicate prevention** — words already in your bank are detected automatically, even across inflected forms

---

## Project Structure

```
gmat-vocab-extractor/
├── backend/
│   ├── handlers/
│   │   ├── extract.go       # /extract-words — calls Gemini
│   │   └── words.go         # /save-word, /get-words, /quiz
│   ├── models/
│   │   └── word.go          # Word struct
│   ├── db/
│   │   └── mongo.go         # MongoDB connection
│   └── main.go              # Server entry point, CORS, routes
└── frontend/
    └── src/
        ├── components/
        │   ├── Home.jsx
        │   ├── PassageInput.jsx
        │   ├── WordCard.jsx
        │   ├── WordBank.jsx
        │   └── Quiz.jsx
        ├── api/
        │   └── index.js     # All fetch calls to Go backend
        └── App.jsx           # Routes
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/extract-words` | Extract vocabulary from a passage via Gemini |
| POST | `/save-word` | Save a word to MongoDB |
| GET | `/get-words` | Fetch all saved words |
| GET | `/quiz` | Generate fill-in-the-blank questions |
| GET | `/health` | Health check |

---

## Running Locally

**Backend**

```bash
cd backend
# create .env file
echo "GEMINI_API_KEY=your_key" >> .env
echo "MONGO_URI=your_atlas_uri" >> .env
echo "PORT=8080" >> .env

go run main.go
```

**Frontend**

```bash
cd frontend
# create .env file
echo "VITE_API_URL=http://localhost:8080" >> .env

npm install
npm run dev
```

---

## Environment Variables

**Backend**

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Server port (default 8080) |
| `ALLOWED_ORIGIN` | Frontend URL for CORS |

**Frontend**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL |

---

## Why context-based learning works

Most vocabulary apps teach words in isolation — a word on one side, a definition on the other. Vocabrium ties every word to the sentence where you first encountered it. When you see "exacerbate" in a quiz, you see the original sentence with the word blanked out — the same way GMAT tests it. This is how vocabulary actually sticks.