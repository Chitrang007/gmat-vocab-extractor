import React, { useState, useEffect } from 'react';
import './SpeedRun.css';

// Your persistent anchor for MongoDB integration later
const hardcoded_id = "MY_USER_ID";

// Dummy data to test the flow
const MOCK_WORDS = [
  { word: "Capricious", options: ["Predictable", "Fickle", "Stubborn", "Heavy"], answer: "Fickle" },
  { word: "Ephemeral", options: ["Fleeting", "Eternal", "Glowing", "Fragile"], answer: "Fleeting" },
  { word: "Mitigate", options: ["Worsen", "Explain", "Alleviate", "Confuse"], answer: "Alleviate" },
  { word: "Cacophony", options: ["Harmony", "Harsh noise", "Sweet melody", "Silence"], answer: "Harsh noise" },
  { word: "Sycophant", options: ["Leader", "Flatterer", "Rebel", "Genius"], answer: "Flatterer" }
];

const SpeedRun = () => {
  const [gameState, setGameState] = useState('START'); // START, PLAYING, FINISHED
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  const currentWord = MOCK_WORDS[wordIndex];
  const multiplier = Math.floor(streak / 3) + 1;

  // Timer logic
  useEffect(() => {
    let timer;
    
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          // Check if the timer is about to hit zero inside the interval
          if (prevTime <= 1) {
            clearInterval(timer);
            setGameState('FINISHED'); // No longer synchronous with the render!
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup function
    return () => clearInterval(timer);
    
  }, [gameState]); // We removed timeLeft from the dependencies!

  const startGame = () => {
    setGameState('PLAYING');
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setWordIndex(0);
  };

  const handleAnswer = (selectedOption) => {
    if (selectedOption === currentWord.answer) {
      // Correct: Base 10 points * streak multiplier + speed bonus
      const speedBonus = Math.floor(timeLeft / 10);
      setScore((prev) => prev + (10 * multiplier) + speedBonus);
      setStreak((prev) => prev + 1);
    } else {
      // Incorrect: Penalize and reset streak. 
      // TODO: Log currentWord.word to MongoDB Weakness Pool using hardcoded_id
      console.log(`Sending ${currentWord.word} to Weakness Pool for user: ${hardcoded_id}`);
      setScore((prev) => Math.max(0, prev - 5));
      setStreak(0);
    }

    // Move to next word, or end if out of words
    if (wordIndex + 1 < MOCK_WORDS.length) {
      setWordIndex((prev) => prev + 1);
    } else {
      setGameState('FINISHED');
    }
  };

  if (gameState === 'START') {
    return (
      <div className="speedrun-container center-content">
        <h2>Speed Run 🚀</h2>
        <p>60 seconds. Lightning-fast recall.</p>
        <button className="action-btn" onClick={startGame}>Start Drill</button>
      </div>
    );
  }

  if (gameState === 'FINISHED') {
    return (
      <div className="speedrun-container center-content">
        <h2>Time's Up! ⏱️</h2>
        <p>Final Score: <strong>{score}</strong></p>
        <button className="action-btn" onClick={startGame}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="speedrun-container">
      {/* HUD Block */}
      <div className="hud">
        <div className={`timer ${timeLeft <= 10 ? 'danger' : ''}`}>
          {timeLeft}s
        </div>
        <div className="streak">
          {streak >= 3 && <span className="fire">🔥 {multiplier}x</span>}
          Streak: {streak}
        </div>
        <div className="score">
          Score: {score}
        </div>
      </div>

      {/* Arena Block */}
      <div className="arena">
        <h1 className="target-word">{currentWord.word}</h1>
      </div>

      {/* Action Grid Block */}
      <div className="action-grid">
        {currentWord.options.map((option, idx) => (
          <button 
            key={idx} 
            className="option-btn" 
            onClick={() => handleAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedRun;