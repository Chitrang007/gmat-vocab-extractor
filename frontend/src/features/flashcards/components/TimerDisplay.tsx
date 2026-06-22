interface TimerDisplayProps {
  remainingSeconds: number
  remainingMs: number
  durationMs?: number
}

export function TimerDisplay({
  remainingSeconds,
  remainingMs,
  durationMs = 30_000,
}: TimerDisplayProps) {
  const progress = Math.max(0, Math.min(100, (remainingMs / durationMs) * 100))
  const isLow = remainingSeconds <= 10

  return (
    <div className={`flashcard-timer ${isLow ? 'flashcard-timer--low' : ''}`}>
      <div className="flashcard-timer__bar">
        <div className="flashcard-timer__fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="flashcard-timer__label">{remainingSeconds}s</span>
    </div>
  )
}
