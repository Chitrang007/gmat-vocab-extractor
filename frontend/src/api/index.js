const BASE = import.meta.env.VITE_API_URL

export async function extractWords(passage) {
  const res = await fetch(`${BASE}/extract-words`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passage })
  })
  if (!res.ok) throw new Error('Failed to extract words')
  return res.json()
}

export async function saveWord(word) {
  const res = await fetch(`${BASE}/save-word`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(word)
  })
  if (!res.ok) throw new Error('Failed to save word')
  return res.json()
}

export async function getWords() {
  const res = await fetch(`${BASE}/get-words`)
  if (!res.ok) throw new Error('Failed to fetch words')
  return res.json()
}

export async function getQuiz() {
  const res = await fetch(`${BASE}/quiz`)
  if (!res.ok) throw new Error('Failed to fetch quiz')
  return res.json()
}