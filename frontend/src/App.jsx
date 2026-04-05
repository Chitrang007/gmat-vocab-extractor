import { useState } from 'react'
import PassageInput from './components/PassageInput'
import WordCard from './components/WordCard'
import { extractWords } from './api/index'

function App() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>GMAT Vocab Extractor</h1>
      <PassageInput onExtract={handleExtract} loading={loading} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {words.map((word, i) => (
          <WordCard key={i} word={word} />
        ))}
      </div>
    </div>
  )
}

export default App