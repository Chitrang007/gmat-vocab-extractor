import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import PassageInput from './components/PassageInput'
import WordCard from './components/WordCard'
import WordBank from './components/WordBank'
import { extractWords, getWords } from './api/index'
import './App.css'

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
        <div className="app-container">
          <header className="app-header">
            <h1>GMAT Vocab Extractor</h1>
            <p className="app-subtitle">Paste a reading comprehension passage to extract advanced vocabulary.</p>
            <button className="wordbank-btn" onClick={() => navigate('/word-bank')}>
              My Word Bank ({savedWords.length})
            </button>
          </header>
          <main className="app-main">
            <PassageInput onExtract={handleExtract} loading={loading} />
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
    </Routes>
  )
}

export default App