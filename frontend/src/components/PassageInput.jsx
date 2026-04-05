import { useState } from 'react'

function PassageInput({ onExtract, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim().length < 20) return
    onExtract(text)
  }

  return (
    <div>
      <textarea
        rows={8}
        style={{ width: '100%', fontSize: '15px', padding: '10px' }}
        placeholder="Paste a GMAT reading comprehension passage here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: '10px', padding: '8px 20px', fontSize: '15px' }}
      >
        {loading ? 'Extracting...' : 'Extract Words'}
      </button>
    </div>
  )
}

export default PassageInput