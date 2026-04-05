import { useNavigate } from 'react-router-dom'
import './Home.css'

function Home({ savedWordsCount }) {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>GMAT Vocab Extractor</h1>
        <p className="home-subtitle">Learn vocabulary in context. Built for serious test prep.</p>
      </header>

      <div className="home-cards">
        <div className="home-card" onClick={() => navigate('/extract')}>
          <div className="home-card-icon">📖</div>
          <h2>Extract Words</h2>
          <p>Paste a reading comprehension passage and extract difficult vocabulary with definitions and context.</p>
          <span className="home-card-cta">Start extracting →</span>
        </div>

        <div className="home-card" onClick={() => navigate('/word-bank')}>
          <div className="home-card-icon">🗂️</div>
          <h2>My Word Bank</h2>
          <p>Review all your saved words, their meanings, and the sentences where you first encountered them.</p>
          <span className="home-card-cta">{savedWordsCount} words saved →</span>
        </div>

        <div className="home-card" onClick={() => navigate('/quiz')}>
          <div className="home-card-icon">🧠</div>
          <h2>Quiz Mode</h2>
          <p>Test yourself with fill-in-the-blank and definition matching questions from your word bank.</p>
          <span className="home-card-cta">Start quiz →</span>
        </div>
      </div>
    </div>
  )
}

export default Home