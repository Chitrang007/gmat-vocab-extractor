export const roastMessages = [
  "Your dictionary is weeping in the corner right now. 😭",
  "Did you close your eyes while typing? 👀",
  "The GMAT algorithm just shed a single tear. 🤖",
  "Are we guessing? Because it looks like we're guessing. 🎲",
  "My backend server is judging you. 📉",
]

export function getRandomRoast(): string {
  return roastMessages[Math.floor(Math.random() * roastMessages.length)]
}