import { speak } from "../utils/speech";
import { useState } from "react";
import "./WordBank.css";

function WordBank({ words, onClose }) {
  const [filter, setFilter] = useState("ALL");

  if (words.length === 0) {
    return (
      <div className="wordbank-container">
        <div className="wordbank-header">
          <h2>Word Bank</h2>
          <button className="close-btn" onClick={onClose}>
            Back
          </button>
        </div>
        <p className="wordbank-empty">
          No words saved yet. Extract a passage and save some words!
        </p>
      </div>
    );
  }

  const filteredWords =
    filter === "ALL"
      ? words
      : words.filter((w) => w.difficulty === filter.toLowerCase());

  return (
    <div className="wordbank-container">
      <div className="wordbank-header">
        <div className="wordbank-header-top">
          <h2>
            Word Bank{" "}
            <span className="word-count">
              {filteredWords.length}/{words.length} words
            </span>
          </h2>
          <button className="close-btn" onClick={onClose}>
            Back
          </button>
        </div>
        <div className="filter-buttons">
          <button
            className={filter === "ALL" ? "active" : ""}
            onClick={() => setFilter("ALL")}
          >
            ALL
          </button>
          <button
            className={filter === "EASY" ? "active" : ""}
            onClick={() => setFilter("EASY")}
          >
            EASY
          </button>
          <button
            className={filter === "MEDIUM" ? "active" : ""}
            onClick={() => setFilter("MEDIUM")}
          >
            MEDIUM
          </button>
          <button
            className={filter === "HARD" ? "active" : ""}
            onClick={() => setFilter("HARD")}
          >
            HARD
          </button>
        </div>
      </div>
      <div className="wordbank-list">
        {filteredWords.map((word, i) => (
          <div key={i} className="wordbank-item">
            <div className="wordbank-header-top">
              <span className="wordbank-word">{word.word}</span>
              <button className="speak-btn" onClick={() => speak(word.word)}>
                🔊
              </button>
              <span className="wordbank-pos">{word.partOfSpeech}</span>
              <span
                className={`difficulty-badge difficulty-${word.difficulty}`}
              >
                {word.difficulty}
              </span>
            </div>
            <p className="wordbank-definition">{word.definition}</p>
            <p className="wordbank-context">"{word.contextSentence}"</p>
            <p className="wordbank-synonyms">
              Synonyms: {word.synonyms?.join(", ")}
            </p>
            <p className="wordbank-antonyms">
              Antonyms: {word.antonyms?.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordBank;
