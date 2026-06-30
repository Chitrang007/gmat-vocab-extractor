import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../../components/QuizMenu.css'
import { ROUND_DURATION_MS } from '../constants/gameConfig'
import { useFlashcardGame } from '../hooks/useFlashcardGame'
import { FeedbackCard } from './FeedbackCard'
import { FlashcardPrompt } from './FlashcardPrompt'
import { SessionSummary } from './SessionSummary'
import { TextAnswerFallback } from './TextAnswerFallback'
import { TimerDisplay } from './TimerDisplay'
import { VoiceInputButton } from './VoiceInputButton'
import '../styles/Flashcards.css'

export function FlashcardGameScreen() {
  const navigate = useNavigate()
  const [textAnswer, setTextAnswer] = useState('')
  const game = useFlashcardGame()

  const handleTextSubmit = () => {
    if (!textAnswer.trim()) return
    game.actions.submitAnswer(textAnswer.trim())
    setTextAnswer('')
  }

  const handleNext = () => {
    setTextAnswer('')
    game.actions.nextRound()
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return

      if (game.phase === 'playing') return

      if (game.phase === 'feedback') {
        event.preventDefault()
        handleNext()
      }

      if (game.phase === 'finished') {
        event.preventDefault()
        setTextAnswer('')
        void game.actions.restartSession()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [game.phase, handleNext, game.actions])

  if (game.phase === 'loading' || game.phase === 'idle') {
    return <p className="quiz-status">Loading flashcards…</p>
  }

  if (game.phase === 'error') {
    return (
      <div className="quiz-container">
        <p className="quiz-status">{game.error ?? 'Something went wrong.'}</p>
        <button type="button" className="back-btn" onClick={() => navigate('/quiz')}>
          Back to Quiz Menu
        </button>
      </div>
    )
  }

  if (game.phase === 'finished') {
    return (
      <SessionSummary
        stats={game.sessionStats}
        onRestart={() => {
          setTextAnswer('')
          void game.actions.restartSession()
        }}
        onExit={() => navigate('/quiz')}
      />
    )
  }

  const round = game.currentRound
  if (!round) {
    return <p className="quiz-status">Preparing next card…</p>
  }

  const isPlaying = game.phase === 'playing'
  const isFeedback = game.phase === 'feedback'
  const isLastRound = game.roundIndex + 1 >= game.maxRounds

  return (
    <div className="quiz-container flashcard-game">
      <div className="quiz-progress">
        <span>
          Round {game.roundIndex + 1} / {game.maxRounds}
        </span>
        <span>Score: {game.sessionStats.score}</span>
      </div>

      <TimerDisplay
        remainingSeconds={game.timer.remainingSeconds}
        remainingMs={game.timer.remainingMs}
        durationMs={ROUND_DURATION_MS}
      />

      <div className="quiz-card flashcard-card">
        <FlashcardPrompt round={round} />
      </div>

      {isPlaying && (
        <>
          <VoiceInputButton
            isSupported={game.speech.isSupported}
            isListening={game.speech.isListening}
            onToggle={game.actions.toggleVoiceInput}
          />

          {game.speech.interimTranscript && (
            <p className="flashcard-interim">Hearing: {game.speech.interimTranscript}</p>
          )}

          {game.speech.error && (
            <p className="flashcard-speech-error">
              Speech error: {game.speech.error.message}. Use text input instead.
            </p>
          )}

          <TextAnswerFallback
            value={textAnswer}
            onChange={setTextAnswer}
            onSubmit={handleTextSubmit}
            placeholder="Or type your answer…"
          />

          <button type="button" className="flashcard-skip-btn" onClick={game.actions.skipRound}>
            Skip
          </button>
        </>
      )}

      {isFeedback && game.lastResult && (
        <FeedbackCard
          result={game.lastResult}
          expectedAnswer={round.expectedAnswers[0]}
          onContinue={handleNext}
          isLastRound={isLastRound}
        />
      )}
    </div>
  )
}

export default FlashcardGameScreen
