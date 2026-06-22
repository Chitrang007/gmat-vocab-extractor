import type { Round } from '../types/flashcard.types'

interface FlashcardPromptProps {
  round: Round
}

export function FlashcardPrompt({ round }: FlashcardPromptProps) {
  return (
    <div className="flashcard-prompt">
      <span className="flashcard-mode-badge">{round.mode.label}</span>
      <p className="flashcard-prompt-label">{round.mode.promptLabel}</p>
      <p className="flashcard-prompt-text">{round.prompt}</p>
    </div>
  )
}
