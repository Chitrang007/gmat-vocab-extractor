import type { SessionStats } from '../types/flashcard.types'

interface SessionSummaryProps {
  stats: SessionStats
  onRestart: () => void
  onExit: () => void
}

export function SessionSummary({ stats, onRestart, onExit }: SessionSummaryProps) {
  const accuracyPct = Math.round(stats.accuracy * 100)

  return (
    <div className="quiz-finished flashcard-summary">
      <h2>Flashcards Complete</h2>
      <p className={`quiz-score ${stats.score === stats.total ? 'perfect' : ''}`}>
        {stats.score} / {stats.total}
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
