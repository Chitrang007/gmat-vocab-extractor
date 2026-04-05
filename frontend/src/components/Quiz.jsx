import { useState, useEffect } from 'react'
import { getQuiz } from '../api/index'
import './Quiz.css'

function Quiz({ onBack }) {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getQuiz()
      .then(data => {
        setQuestions(data)
        setLoading(false)
      })
      .catch(err => {
        setError('Need at least 4 saved words to start the quiz.')
        console.log(err)
        setLoading(false)
      })
  }, [])

  const handleSelect = (option) => {
    if (selected) return
    setSelected(option)
    if (option === questions[current].answer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(prev => prev + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (loading) return <p className="quiz-status">Loading quiz...</p>
  if (error) return <p className="quiz-status">{error}</p>

  const isPerfect = score === questions.length

  if (finished) {
    return (
      <div className="quiz-finished">
        <h2>Quiz Complete</h2>
        <p className={`quiz-score ${isPerfect ? 'perfect' : ''}`}>
          {score} / {questions.length}
        </p>
        <p className={`quiz-score-label ${isPerfect ? 'perfect' : ''}`}>
          {isPerfect ? 'Perfect score!' : score >= questions.length / 2 ? 'Good job!' : 'Keep practicing!'}
        </p>
        <div className="quiz-finished-btns">
          <button className="back-btn" onClick={handleRestart}>Try Again</button>
          <button className="back-btn" onClick={onBack}>Back to Home</button>
        </div>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        <span>{current + 1} / {questions.length}</span>
        <span>Score: {score}</span>
      </div>

      <div className="quiz-card">
        <p className="quiz-sentence">{q.sentence}</p>
        <p className="quiz-hint">{q.definition}</p>
      </div>

      <div className="quiz-options">
        {q.options.map((option, i) => {
          let className = 'quiz-option'
          if (selected) {
            if (option === q.answer) className += ' correct'
            else if (option === selected) className += ' wrong'
          }
          return (
            <button
              key={i}
              className={className}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
            >
              {option}
            </button>
          )
        })}
      </div>

      {selected && (
        <button className="quiz-next-btn" onClick={handleNext}>
          {current + 1 >= questions.length ? 'See Results' : 'Next →'}
        </button>
      )}
    </div>
  )
}

export default Quiz