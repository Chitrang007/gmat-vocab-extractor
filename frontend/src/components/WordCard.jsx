function WordCard({ word }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '12px 0'
    }}>
      <h2 style={{ margin: '0 0 6px' }}>{word.word}
        <span style={{ fontSize: '13px', color: '#888', marginLeft: '10px' }}>
          {word.partOfSpeech}
        </span>
      </h2>
      <p style={{ margin: '4px 0' }}>{word.definition}</p>
      <p style={{ color: '#555', fontStyle: 'italic', margin: '4px 0' }}>
        "{word.contextSentence}"
      </p>
      <p style={{ margin: '4px 0', color: '#444' }}>
        Synonyms: {word.synonyms?.join(', ')}
      </p>
      <span style={{
        fontSize: '12px',
        padding: '2px 8px',
        borderRadius: '4px',
        background: word.difficulty === 'hard' ? '#fee' : word.difficulty === 'medium' ? '#fff8e1' : '#e8f5e9',
        color: word.difficulty === 'hard' ? '#c00' : word.difficulty === 'medium' ? '#795' : '#2a2'
      }}>
        {word.difficulty}
      </span>
    </div>
  )
}

export default WordCard