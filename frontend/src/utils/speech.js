export const speak = (word) => {
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
}