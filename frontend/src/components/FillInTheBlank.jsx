import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getWords } from "../api/index";
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
  const [finalMessage, setFinalMessage] = useState("");
  
  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const q = questions[current];
    const userInput = inputValue.trim().toLowerCase();
    const targetWord = q.answer.toLowerCase();
    const validSynonyms = q.synonyms ? q.synonyms.map(s => s.toLowerCase()) : [];

    const correct = userInput === targetWord || validSynonyms.includes(userInput);
    
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  }, [current, questions, inputValue]);

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      const ratio = score / questions.length;
      if (ratio === 1) {
        setFinalMessage("Perfect score!");
      } else if (ratio >= 0.8) {
        setFinalMessage("Great job!");
      } else if (ratio >= 0.5) {
        setFinalMessage("Keep Practicing!");
      } else {
        const roasts = [
          "Your dictionary is weeping in the corner right now. 😭",
          "Did you close your eyes while typing? 👀",
          "The GMAT algorithm just shed a single tear. 🤖",
          "Are we guessing? Because it looks like we're guessing. 🎲",
          "My backend server is judging you. 📉",
        ];
        setFinalMessage(roasts[Math.floor(Math.random() * roasts.length)]);
      }
      setFinished(true);
    } else {
      setCurrent((prev) => prev + 1);
      setInputValue("");
      setIsSubmitted(false);
      setIsCorrect(null);
    }
  }, [current, questions.length, score]);

  useEffect(() => {
    getWords()
      .then((data) => {
        const validData = data.filter(w => w.contextSentence && w.word);

        if (validData.length < 4) {
          throw new Error("Not enough words with context sentences.");
        }

        const shuffledBank = shuffleArray(validData);
        const selectedQuestions = shuffledBank.slice(0, MAX_QUESTIONS);

        const fillInTheBlankData = selectedQuestions.map((q) => {
          const targetWord = q.word;
          const regex = new RegExp(targetWord, 'gi');
          let maskedSentence = q.contextSentence.replace(regex, "________");
          
          if (maskedSentence === q.contextSentence) {
             maskedSentence = q.contextSentence + " (Hint: conjugate '________')";
          }

          return {
            ...q,
            maskedSentence,
            answer: targetWord
          };
        });

        setQuestions(fillInTheBlankData);
        setLoading(false);
      })
      .catch((err) => {
        setError("Need at least 4 saved words with context sentences to start.");
        console.log(err);
        setLoading(false);
      });
  }, []);

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

  const handleRestart = () => {
    setCurrent(0);
    setInputValue("");
    setIsSubmitted(false);
    setIsCorrect(null);
    setScore(0);
    setFinished(false);
  };

  if (loading) return <p className="quiz-status">Loading quiz...</p>;
  if (error) return <p className="quiz-status">{error}</p>;
  if (questions.length === 0)
    return <p className="quiz-status">Not enough words to generate a quiz.</p>;

  const isPerfect = score === questions.length;

  if (finished) {
    const ratio = score / questions.length;
    return (
      <div className="quiz-finished">
        <h2>Exam Complete</h2>

        {ratio < 0.5 && (
          <img 
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FjYjY0ZDIwYjY0YjY0YjY0YjY0YjY0YjY0YjY0YjY0YjY0JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/11ykUODgXjAXZu/giphy.gif" 
            alt="Disappointed" 
            style={{ width: '200px', borderRadius: '10px', marginTop: '1rem' }}
          />
        )}

        <p className={`quiz-score ${isPerfect ? "perfect" : ""}`}>
          {score} / {questions.length}
        </p>
        <p className={`quiz-score-label ${isPerfect ? "perfect" : ""}`}>
          {finalMessage}
        </p>
        <div className="quiz-finished-btns">
          <button className="back-btn" onClick={handleRestart}>Try Again</button>
          <button className="back-btn" onClick={() => navigate("/quiz")}>Back to Quiz Menu</button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <span>{current + 1} / {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="quiz-card">
        <p className="quiz-sentence" style={{ fontSize: '20px', lineHeight: '1.6' }}>
          {q.maskedSentence}
        </p>
        <p className="quiz-hint" style={{ marginTop: '15px' }}>
          <strong>Definition:</strong> {q.definition}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
        <input 
          ref={inputRef}
          type="text"
          placeholder="Type the exact word or a synonym..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isSubmitted}
          autoFocus
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '16px',
            background: isSubmitted ? (isCorrect ? '#064e3b' : '#7f1d1d') : '#0d1117',
            border: '2px solid',
            borderColor: isSubmitted ? (isCorrect ? '#10b981' : '#ef4444') : '#1e2d40',
            borderRadius: '10px',
            color: '#e2e8f0',
            fontSize: '18px',
            textAlign: 'center',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'all 0.3s ease'
          }}
        />

        {isSubmitted && (
          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '16px' }}>
            {isCorrect ? (
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>Correct!</span>
            ) : (
              <span style={{ color: '#ef4444' }}>
                Not quite. The target word was <strong style={{ color: '#e2e8f0' }}>{q.answer}</strong>.
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
        <button 
          className="quiz-next-btn" 
          onClick={handleNext}
        >
          {current + 1 >= questions.length ? "See Results" : "Next Question →"}
        </button>
      )}
    </div>
  );
}

export default FillInTheBlank;