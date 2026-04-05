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