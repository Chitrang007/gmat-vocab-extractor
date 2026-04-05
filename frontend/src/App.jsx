import { useState, useEffect } from 'react'
import PassageInput from './components/PassageInput'
import WordCard from './components/WordCard'
import { extractWords, getWords } from './api/index'
import './App.css'

function App() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedWords, setSavedWords] = useState([])

  useEffect(() => {
    getWords()
      .then(data => setSavedWords(data.map(w => w.word)))
      .catch(err => console.log(err))
  }, [])

  const handleSave = (word) => {
    setSavedWords(prev => [...prev, word.word])
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
    <div className="app-container">
      <header className="app-header">
        <h1>GMAT Vocab Extractor</h1>
        <p className="app-subtitle">Paste a reading comprehension passage to extract advanced vocabulary.</p>
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
  )
}

export default App