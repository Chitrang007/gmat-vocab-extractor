import { useState } from "react"
import { saveWord } from "../api/index"
import "./WordCard.css"

function WordCard({ word, alreadySaved = false, onSave }) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveWord(word)
      onSave(word)
    } catch (err) {
      console.log(err)
      alert('Failed to save word')
    } finally {
      setSaving(false)
    }
  }

  const difficultyClass = `difficulty-badge difficulty-${word.difficulty}`

  return (
    <div className="word-card">
      <div className="word-card-header">
        <h2 className="word-title">{word.word}</h2>
        <span className="word-pos">{word.partOfSpeech}</span>
      </div>
      <p className="word-definition">{word.definition}</p>
      <p className="word-context">"{word.contextSentence}"</p>
      <p className="word-synonyms">Synonyms: {word.synonyms?.join(', ')}</p>
      <div className="word-card-footer">
        <span className={difficultyClass}>{word.difficulty}</span>
        <button
          onClick={handleSave}
          disabled={alreadySaved || saving}
          className={`save-btn ${alreadySaved ? 'saved' : ''}`}
        >
          {alreadySaved ? 'Saved!' : saving ? 'Saving...' : 'Save Word'}
        </button>
      </div>
    </div>
  )
}

export default WordCard