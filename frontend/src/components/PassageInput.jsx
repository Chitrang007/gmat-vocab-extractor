import { useState } from 'react'
import './PassageInput.css'
import { toast } from 'react-toastify'

function PassageInput({ onExtract, loading }) {
  const [text, setText] = useState('')

  const handleSubmit = async () => {
    if (text.trim().length < 20) return
    onExtract(text)
    
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/'

    try {
      const response = await fetch(`${backendUrl}api/passages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error('Failed to save passage:', response.statusText);
      } else {
        console.log('Passage saved successfully');
        toast.success('Passage saved successfully!', {
          position : "top-right",
          autoClose : 3000,
          hideProgressBar : true,
          theme : "dark",
        });
      }
    } catch (error) {
      console.error('Network error while saving passage:', error);
    }
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