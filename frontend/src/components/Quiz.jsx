import { useNavigate } from "react-router-dom";
import "./Quiz.css";

function QuizMenu() {
  const navigate = useNavigate();

  return (
    <div className="quiz-menu-container">
      <div className="quiz-menu-header">
        <h2>Training Modes</h2>
        <p>Select a specialized drill to test your vocabulary.</p>
      </div>

      <div className="quiz-menu-grid">
        {/* Notice how these now use navigate() with the specific URL path */}
        <button 
          className="menu-mode-btn" 
          onClick={() => navigate("/quiz/multi-choice")}
        >
          <h3>Classic Multiple Choice</h3>
          <p>Test your fundamental definition recall.</p>
        </button>
        
        <button 
          className="menu-mode-btn" 
          onClick={() => navigate("/quiz/fill-in-the-blank")}
        >
          <h3>Fill in the Blank</h3>
          <p>Master contextual usage in complex sentences.</p>
        </button>
        
        <button 
          className="menu-mode-btn" 
          onClick={() => navigate("/quiz/synonym-antonym")}
        >
          <h3>Synonym & Antonym</h3>
          <p>Build lateral word associations.</p>
        </button>
        
        <button 
          className="menu-mode-btn" 
          onClick={() => navigate("/quiz/speed")}
        >
          <h3>Speed Run</h3>
          <p>60 seconds. Lightning-fast recall.</p>
        </button>
        
        <button 
          className="menu-mode-btn" 
          onClick={() => navigate("/quiz/weakness")}
        >
          <h3>Weakness Drill</h3>
          <p>Confront the words you miss the most.</p>
        </button>
      </div>
    </div>
  );
}

export default QuizMenu;