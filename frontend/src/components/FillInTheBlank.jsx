import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getWords } from "../api/index";
import { evaluateResult } from "../shared/gameResults";
import "./QuizMenu.css";

const MAX_QUESTIONS = 10;

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function FillInTheBlank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const q = questions[current];
    const userInput = inputValue.trim().toLowerCase();
    const targetWord = q.answer.toLowerCase();
    const validSynonyms = q.synonyms
      ? q.synonyms.map((s) => s.toLowerCase())
      : [];

    const correct =
      userInput === targetWord || validSynonyms.includes(userInput);

    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  }, [current, questions, inputValue]);

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((prev) => prev + 1);
      setInputValue("");
      setIsSubmitted(false);
      setIsCorrect(null);
    }
  }, [current, questions.length]);

  const initializeGame = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getWords();
      const validData = data.filter((w) => w.contextSentence && w.word);

      if (validData.length < 4) {
        throw new Error("Not enough words with context sentences.");
      }

      const shuffledBank = shuffleArray(validData);
      const selectedQuestions = shuffledBank.slice(0, MAX_QUESTIONS);

      const fillInTheBlankData = selectedQuestions.map((q) => {
        const targetWord = q.word;
        const regex = new RegExp(targetWord, "gi");
        let maskedSentence = q.contextSentence.replace(regex, "________");

        if (maskedSentence === q.contextSentence) {
          maskedSentence = q.contextSentence + " (Hint: conjugate '________')";
        }

        return {
          ...q,
          maskedSentence,
          answer: targetWord,
        };
      });

      setQuestions(fillInTheBlankData);

      setCurrent(0);
      setInputValue("");
      setIsSubmitted(false);
      setIsCorrect(null);
      setScore(0);
      setFinished(false);
    } catch (err) {
      setError("An error occurred while initializing the game.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (!isSubmitted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [current, isSubmitted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && inputValue.trim()) {
        if (!isSubmitted) {
          handleSubmit();
        } else {
          handleNext();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputValue, isSubmitted, handleSubmit, handleNext]);

  if (loading) return <p className="quiz-status">Loading quiz...</p>;
  if (error) return <p className="quiz-status">{error}</p>;

  if (questions.length === 0)
    return <p className="quiz-status">Not enough words to generate a quiz.</p>;

  if (finished) {
    const isPerfect = score === questions.length;
    const result = evaluateResult(score, questions.length);
    return (
      <div className="quiz-finished">
        <h2>Quiz Complete</h2>

        {result.image && (
          <img
            src={result.image}
            alt="Result"
            style={{
              width: "220px",
              borderRadius: "10px",
              margin: "1rem 0",
            }}
          />
        )}

        <p className={`quiz-score ${isPerfect ? "perfect" : ""}`}>
          {score} / {questions.length}
        </p>
        <p className={`quiz-score-label ${isPerfect ? "perfect" : ""}`}>
          {result.message}
        </p>
        <div className="quiz-finished-btns">
          <button className="back-btn" onClick={initializeGame}>
            Play Again
          </button>
          <button className="back-btn" onClick={() => navigate("/quiz")}>
            Back to Quiz Menu
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <span>
          {current + 1} / {questions.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="quiz-card">
        <p
          className="quiz-sentence"
          style={{ fontSize: "20px", lineHeight: "1.6" }}
        >
          {q.maskedSentence}
        </p>
        <p className="quiz-hint" style={{ marginTop: "15px" }}>
          <strong>Definition:</strong> {q.definition}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "20px 0",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type the exact word or a synonym..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isSubmitted}
          autoFocus
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "16px",
            background: isSubmitted
              ? isCorrect
                ? "#064e3b"
                : "#7f1d1d"
              : "#0d1117",
            border: "2px solid",
            borderColor: isSubmitted
              ? isCorrect
                ? "#10b981"
                : "#ef4444"
              : "#1e2d40",
            borderRadius: "10px",
            color: "#e2e8f0",
            fontSize: "18px",
            textAlign: "center",
            outline: "none",
            fontFamily: "inherit",
            transition: "all 0.3s ease",
          }}
        />

        {isSubmitted && (
          <div
            style={{ marginTop: "15px", textAlign: "center", fontSize: "16px" }}
          >
            {isCorrect ? (
              <span style={{ color: "#10b981", fontWeight: "bold" }}>
                Correct!
              </span>
            ) : (
              <span style={{ color: "#ef4444" }}>
                Not quite. The target word was{" "}
                <strong style={{ color: "#e2e8f0" }}>{q.answer}</strong>.
              </span>
            )}
          </div>
        )}
      </div>

      {!isSubmitted ? (
        <button
          className="quiz-next-btn"
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
        >
          Submit
        </button>
      ) : (
        <button className="quiz-next-btn" onClick={handleNext}>
          {current + 1 >= questions.length ? "See Results" : "Next →"}
        </button>
      )}
    </div>
  );
}

export default FillInTheBlank;
