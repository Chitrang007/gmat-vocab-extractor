import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import PassageInput from './components/PassageInput'
import WordCard from './components/WordCard'
import WordBank from './components/WordBank'
import { extractWords, getWords } from './api/index'
import './App.css'
import QuizMenu from './components/Quiz'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './components/PassageInput.css'
import MultiChoice from './components/MultiChoice'

function App() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedWords, setSavedWords] = useState([])
  const [savedWordObjects, setSavedWordObjects] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getWords()
      .then(data => {
        setSavedWordObjects(data)
        setSavedWords(data.map(w => w.word))
      })
      .catch(err => console.log(err))
  }, [])

  const handleSave = (word) => {
    setSavedWords(prev => [...prev, word.word])
    setSavedWordObjects(prev => [...prev, word])
  }

  const handleExtract = async (passage) => {
    setLoading(true)
    setError('')
    setWords([])
    try {
      const result = await extractWords(passage)
      setWords(result)
    } catch (err) {
      setError('Something went wrong. Is the backend running?')
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Routes>
      <Route path="/" element={
        <Home savedWordsCount={savedWords.length} />
      } />

      <Route path="/extract" element={
        <div className="app-container">
          <div className="page-nav">
            <h2>Extract Words</h2>
            <button className="back-btn" onClick={() => navigate('/')}>Back</button>
          </div>
          <p className="app-subtitle">Paste a passage to extract vocabulary for better understanding.</p>
          <main className="app-main">
            <PassageInput onExtract={handleExtract} loading={loading} />
            <ToastContainer />
            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}
            <div className="word-list">
              {words.map((word, i) => (
                <WordCard
                  key={i}
                  word={word}
                  alreadySaved={savedWords.some(sw =>
                    sw && (
                      sw.toLowerCase() === word.word.toLowerCase() ||
                      word.word.toLowerCase().startsWith(sw.toLowerCase()) ||
                      sw.toLowerCase().startsWith(word.word.toLowerCase())
                    )
                  )}
                  onSave={handleSave}
                />
              ))}
            </div>
          </main>
        </div>
      } />

      <Route path="/word-bank" element={
        <WordBank
          words={savedWordObjects}
          onClose={() => navigate('/')}
        />
      } />

      <Route path="/quiz" element={
        <div className="app-container">
          <div className="page-nav">
            <h2>Quiz Mode</h2>
            <button className="back-btn" onClick={() => navigate('/')}>Back</button>
          </div>
          <QuizMenu />
        </div>
      } />

      <Route path="/quiz/multi-choice" element={
        <div className="app-container">
          <div className="page-nav">
            <h2>Multiple Choice</h2>
            <button className="back-btn" onClick={() => navigate('/quiz')}>Back</button>
          </div>
          <MultiChoice />
        </div>
      } />

      <Route path="/quiz/*" element={
        <div className="app-container">
          <div className="page-nav">
            <h2>Coming Soon</h2>
            <button className="back-btn" onClick={() => navigate('/quiz')}>Back</button>
          </div>
          <div className="quiz-finished">
            <h2>Under Construction 🚧</h2>
            <p className="quiz-status" style= {{ marginTop: "1rem"}}>
              This game mode is currently being built. Stick to Classic Multiple Choice for now!
            </p>
            <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3QyaWRwYm1wOXJ1d3NlZWd3MGQydjhvenI2NGJlcHQ4MngwcGs1byZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ruyS8Zw9sBqE5UjOnY/giphy.webp" alt="Failure" className="result-gif" />
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App