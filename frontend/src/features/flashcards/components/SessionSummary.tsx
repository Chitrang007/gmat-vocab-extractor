import type { SessionStats } from '../types/flashcard.types'
import { evaluateResult } from '../../../shared/gameResults'

interface SessionSummaryProps {
  stats: SessionStats
  onRestart: () => void
  onExit: () => void
}

export function SessionSummary({ stats, onRestart, onExit }: SessionSummaryProps) {
  const accuracyPct = Math.round(stats.accuracy * 100)
  const result = evaluateResult(stats.score, stats.total)
  const isPerfect = stats.score === stats.total

  return (
    <div className="quiz-finished flashcard-summary">
      <h2>Flashcards Complete</h2>

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
      <p className={`quiz-score ${isPerfect ? 'perfect' : ''}`}>
        {stats.score} / {stats.total}
      </p>
      <p className={`quiz-score-label ${isPerfect ? 'perfect' : ''}`}>
        {result.message}
      </p>
      <p className="quiz-score-label">{accuracyPct}% accuracy</p>
      <div className="quiz-finished-btns">
        <button type="button" className="back-btn" onClick={onRestart}>
          Play Again
        </button>
        <button type="button" className="back-btn" onClick={onExit}>
          Back to Quiz Menu
        </button>
      </div>
    </div>
  )
}
