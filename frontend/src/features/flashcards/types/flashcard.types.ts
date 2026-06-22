export interface Word {
  word: string
  definition: string
  contextSentence: string
  synonyms: string[]
  antonyms: string[]
  difficulty: string
  partOfSpeech: string
}

export type ModeId =
  | 'WORD_TO_DEFINITION'
  | 'DEFINITION_TO_WORD'
  | 'EXAMPLE_TO_WORD'
  | 'SYNONYM_TO_WORD'
  | 'ANTONYM_TO_WORD'

export type GamePhase =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'feedback'
  | 'finished'
  | 'error'

export type MatchType = 'exact' | 'synonym' | 'fuzzy' | 'none'

export interface ModeDefinition {
  id: ModeId
  label: string
  promptLabel: string
  getPrompt: (word: Word) => string
  getExpectedAnswers: (word: Word) => string[]
  isEligible: (word: Word) => boolean
  acceptSynonyms?: boolean
}

export interface Round {
  roundId: string
  roundIndex: number
  word: Word
  mode: ModeDefinition
  prompt: string
  expectedAnswers: string[]
  acceptSynonyms: boolean
  startedAt: number
}

export interface EvaluationResult {
  isCorrect: boolean
  score: number
  matchType: MatchType
  confidence: number
  feedback: string
  normalizedInput: string
  normalizedExpected: string
}

export interface RoundResult {
  roundId: string
  word: string
  modeId: ModeId
  evaluation: EvaluationResult
  timedOut: boolean
  skipped: boolean
  responseTimeMs: number
}

export interface SessionStats {
  score: number
  total: number
  accuracy: number
  accuracyByWord: Record<string, { attempts: number; correct: number }>
  modeBreakdown: Record<ModeId, { attempts: number; correct: number }>
}

export interface GameConfig {
  maxRounds: number
  durationMs: number
}

export interface GameState {
  phase: GamePhase
  roundIndex: number
  maxRounds: number
  currentRound: Round | null
  roundResults: RoundResult[]
  sessionStats: SessionStats
  error: string | null
}

export interface SubmitAnswerOptions {
  timedOut?: boolean
  skipped?: boolean
}
