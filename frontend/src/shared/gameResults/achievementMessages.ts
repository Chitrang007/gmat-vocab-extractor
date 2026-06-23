export const averageAchievements = [
  "Nice work. You're building momentum. 📚",
  "Every word learned today is a point earned tomorrow. 🎯",
  "Progress is progress. Keep going. 💪",
  "Your vocabulary bank just got a little stronger. 🧠",
  "Good effort. Consistency beats intensity. 🔥",
]

export const aboveAverageAchievements = [
  "That was clean. Your word bank is getting dangerous. 📚",
  "Excellent recall. Those study sessions are paying off. 🚀",
  "The dictionary approves. ✅",
  "Strong performance. Keep stacking those wins. 💪",
  "Precision, speed, and accuracy. Nicely done. ⚡",
  "You're turning obscure words into common knowledge. 🧠",
]

export const perfectAchievements = [
  "You didn't just pass the quiz — you owned it. 👑",
  "Future 700+ energy detected. 📈",
  "Verbal section: respectfully concerned. 😏",
  "RC passages fear this level of vocabulary. 📚",
  "Critical Reasoning is taking notes. 🧠",
  "One step closer to making the GMAT adaptive algorithm sweat. 🤖",
  "This is what consistency looks like. 🔥",
  "Vocabulary unlocked. The GMAT should be nervous. 🎯",
  "Perfect score! The GMAT algorithm just updated its threat model. 👑",
]

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getAverageAchievement() {
  return getRandomMessage(averageAchievements);
}

export function getAboveAverageAchievement() {
  return getRandomMessage(aboveAverageAchievements);
}

export function getPerfectAchievement() {
  return getRandomMessage(perfectAchievements);
}