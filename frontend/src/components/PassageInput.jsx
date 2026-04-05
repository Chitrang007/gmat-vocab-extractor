import { useState } from 'react'
import './PassageInput.css'

function PassageInput({ onExtract, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim().length < 20) return
    onExtract(text)
  }

  return (
    <div className="passage-input-container">
      <textarea
        className="passage-textarea"
        rows={8}
        placeholder="Paste a GMAT reading comprehension passage here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="extract-btn"
        onClick={handleSubmit}
        disabled={loading || text.trim().length < 20}
      >
        {loading ? 'Extracting...' : 'Extract Words'}
      </button>
    </div>
  )
}

export default PassageInput