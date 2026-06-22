interface TextAnswerFallbackProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
}

export function TextAnswerFallback({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type your answer…',
}: TextAnswerFallbackProps) {
  return (
    <div className="flashcard-text-input">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && value.trim()) {
            onSubmit()
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      <button
        type="button"
        className="quiz-next-btn"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
      >
        Submit
      </button>
    </div>
  )
}
