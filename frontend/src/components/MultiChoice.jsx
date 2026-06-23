import { useState, useEffect, useCallback } from "react";
import { getMultiChoiceQuiz } from "../api/index";
import { useNavigate } from "react-router-dom";
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

function MultiChoice() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    }
  }, [current, questions.length]);

  const initializeGame = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMultiChoiceQuiz();
      const shuffledBank = shuffleArray(data);
      const selectedQuestions = shuffledBank.slice(0, MAX_QUESTIONS);

      const randomizedData = selectedQuestions.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
      setQuestions(randomizedData);

      setCurrent(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
    } catch (err) {
      setError("Need at least 4 saved words to start the quiz.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && selected) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, handleNext]);

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    if (option === questions[current].answer) {
      setScore((prev) => prev + 1);
    }
  };

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
        <p className="quiz-sentence">{q.sentence}</p>
        <p className="quiz-hint">{q.definition}</p>
      </div>

      <div className="quiz-options">
        {q.options.map((option, i) => {
          let className = "quiz-option";
          if (selected) {
            if (option === q.answer) className += " correct";
            else if (option === selected) className += " wrong";
          }
          return (
            <button
              key={i}
              className={className}
              onClick={() => handleSelect(option)}
              aria-disabled={!!selected}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected && (
        <button className="quiz-next-btn" onClick={handleNext}>
          {current + 1 >= questions.length ? "See Results" : "Next →"}
        </button>
      )}
    </div>
  );
}

export default MultiChoice;
