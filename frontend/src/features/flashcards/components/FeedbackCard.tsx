import type { RoundResult } from '../types/flashcard.types'

interface FeedbackCardProps {
  result: RoundResult
  expectedAnswer: string
  onContinue: () => void
  isLastRound: boolean
}

export function FeedbackCard({
  result,
  expectedAnswer,
  onContinue,
  isLastRound,
}: FeedbackCardProps) {
  const { evaluation, timedOut, skipped } = result

  return (
    <div className={`flashcard-feedback ${evaluation.isCorrect ? 'flashcard-feedback--correct' : 'flashcard-feedback--wrong'}`}>
      <h3>{evaluation.isCorrect ? 'Correct!' : timedOut ? "Time's up!" : skipped ? 'Skipped' : 'Not quite'}</h3>
      <p className="flashcard-feedback__score">Score: {evaluation.score}/10</p>
      <p className="flashcard-feedback__message">{evaluation.feedback}</p>
      {!evaluation.isCorrect && (
        <p className="flashcard-feedback__expected">
          Expected: <strong>{expectedAnswer}</strong>
        </p>
      )}
      <button type="button" className="quiz-next-btn" onClick={onContinue}>
        {isLastRound ? 'See Results' : 'Next Card →'}
      </button>
    </div>
  )
}
