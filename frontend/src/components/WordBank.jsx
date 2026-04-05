import { speak } from '../utils/speech'
import './WordBank.css'

function WordBank({ words, onClose }) {
  if (words.length === 0) {
    return (
      <div className="wordbank-container">
        <div className="wordbank-header">
          <h2>My Word Bank</h2>
          <button className="close-btn" onClick={onClose}>Back</button>
        </div>
        <p className="wordbank-empty">No words saved yet. Extract a passage and save some words!</p>
      </div>
    )
  }

  return (
    <div className="wordbank-container">
      <div className="wordbank-header">
        <h2>My Word Bank <span className="word-count">{words.length} words</span></h2>
        <button className="close-btn" onClick={onClose}>Back</button>
      </div>
      <div className="wordbank-list">
        {words.map((word, i) => (
          <div key={i} className="wordbank-item">
            <div className="wordbank-item-header">
              <span className="wordbank-word">{word.word}</span>
              <button className="speak-btn" onClick={() => speak(word.word)}>🔊</button>
              <span className="wordbank-pos">{word.partOfSpeech}</span>
              <span className={`difficulty-badge difficulty-${word.difficulty}`}>
                {word.difficulty}
              </span>
            </div>
            <p className="wordbank-definition">{word.definition}</p>
            <p className="wordbank-context">"{word.contextSentence}"</p>
            <p className="wordbank-synonyms">Synonyms: {word.synonyms?.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordBank