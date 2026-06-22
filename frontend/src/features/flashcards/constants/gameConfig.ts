export const ROUND_DURATION_MS = 30_000
export const MIN_WORDS = 4
export const MAX_ROUNDS = 10
export const FUZZY_THRESHOLD = 0.85
export const FUZZY_PARTIAL_THRESHOLD = 0.75

export const GAME_CONFIG = {
  maxRounds: MAX_ROUNDS,
  durationMs: ROUND_DURATION_MS,
  minWords: MIN_WORDS,
} as const
