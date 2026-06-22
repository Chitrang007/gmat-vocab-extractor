interface VoiceInputButtonProps {
  isSupported: boolean
  isListening: boolean
  disabled?: boolean
  onToggle: () => void
}

export function VoiceInputButton({
  isSupported,
  isListening,
  disabled = false,
  onToggle,
}: VoiceInputButtonProps) {
  if (!isSupported) {
    return (
      <p className="flashcard-voice-fallback-note">
        Voice input unavailable — use the text field below.
      </p>
    )
  }

  return (
    <button
      type="button"
      className={`flashcard-voice-btn ${isListening ? 'flashcard-voice-btn--active' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={isListening}
    >
      {isListening ? '🎙️ Listening…' : '🎤 Tap to Speak'}
    </button>
  )
}
