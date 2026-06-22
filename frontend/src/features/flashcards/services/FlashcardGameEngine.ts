import { GAME_CONFIG, MIN_WORDS } from '../constants/gameConfig'
import type {
  GameConfig,
  GamePhase,
  GameState,
  Round,
  RoundResult,
  SubmitAnswerOptions,
} from '../types/flashcard.types'
import {
  analyticsService,
  createEmptySessionStats,
  updateSessionStats,
} from './AnalyticsService'
import { answerEvaluator } from './AnswerEvaluator'
import { flashcardModesService } from './FlashcardModesService'
import { wordBankService } from './WordBankService'

export class FlashcardGameEngine {
  private phase: GamePhase = 'idle'
  private roundIndex = 0
  private maxRounds: number = GAME_CONFIG.maxRounds
  private currentRound: Round | null = null
  private roundResults: RoundResult[] = []
  private sessionStats = createEmptySessionStats()
  private error: string | null = null
  private lastModeId: Round['mode']['id'] | undefined

  getState(): GameState {
    return {
      phase: this.phase,
      roundIndex: this.roundIndex,
      maxRounds: this.maxRounds,
      currentRound: this.currentRound,
      roundResults: [...this.roundResults],
      sessionStats: { ...this.sessionStats },
      error: this.error,
    }
  }

  async start(config: Partial<GameConfig> = {}): Promise<GameState> {
    this.phase = 'loading'
    this.roundIndex = 0
    this.roundResults = []
    this.sessionStats = createEmptySessionStats()
    this.error = null
    this.lastModeId = undefined
    this.maxRounds = config.maxRounds ?? GAME_CONFIG.maxRounds

    try {
      await wordBankService.load()
      if (!wordBankService.hasMinimumWords(MIN_WORDS)) {
        throw new Error(`Need at least ${MIN_WORDS} saved words to start Flashcards Mode.`)
      }
      this.phase = 'ready'
    } catch (err) {
      this.phase = 'error'
      this.error = err instanceof Error ? err.message : 'Failed to load word bank.'
    }

    return this.getState()
  }

  beginRound(): GameState {
    if (this.phase === 'finished' || this.phase === 'error') {
      return this.getState()
    }

    if (this.roundIndex >= this.maxRounds) {
      this.phase = 'finished'
      analyticsService.trackSessionEnd(this.sessionStats)
      return this.getState()
    }

    const word = wordBankService.next()
    if (!word) {
      this.phase = 'finished'
      analyticsService.trackSessionEnd(this.sessionStats)
      return this.getState()
    }

    const mode = flashcardModesService.pickRandomMode(word, this.lastModeId)
    this.currentRound = flashcardModesService.buildRound(word, this.roundIndex, mode.id)
    this.lastModeId = this.currentRound.mode.id
    this.phase = 'playing'

    return this.getState()
  }

  submitAnswer(input: string, options: SubmitAnswerOptions = {}): GameState {
    if (!this.currentRound || this.phase !== 'playing') {
      return this.getState()
    }

    const evaluation = answerEvaluator.evaluate(input, this.currentRound)
    const forcedIncorrect = options.timedOut || options.skipped

    const finalEvaluation = forcedIncorrect
      ? {
          ...evaluation,
          isCorrect: false,
          score: 0,
          matchType: 'none' as const,
          feedback: options.timedOut
            ? `Time's up! The expected answer was "${this.currentRound.expectedAnswers[0]}".`
            : options.skipped
              ? `Skipped. The expected answer was "${this.currentRound.expectedAnswers[0]}".`
              : evaluation.feedback,
        }
      : evaluation

    const result: RoundResult = {
      roundId: this.currentRound.roundId,
      word: this.currentRound.word.word,
      modeId: this.currentRound.mode.id,
      evaluation: finalEvaluation,
      timedOut: Boolean(options.timedOut),
      skipped: Boolean(options.skipped),
      responseTimeMs: Date.now() - this.currentRound.startedAt,
    }

    this.roundResults.push(result)
    this.sessionStats = updateSessionStats(this.sessionStats, result)
    analyticsService.trackRound(result)
    this.phase = 'feedback'

    return this.getState()
  }

  skipRound(): GameState {
    return this.submitAnswer('', { skipped: true })
  }

  handleTimeout(): GameState {
    return this.submitAnswer('', { timedOut: true })
  }

  nextRound(): GameState {
    if (this.phase !== 'feedback') {
      return this.getState()
    }

    this.roundIndex += 1
    this.currentRound = null

    if (this.roundIndex >= this.maxRounds) {
      this.phase = 'finished'
      analyticsService.trackSessionEnd(this.sessionStats)
      return this.getState()
    }

    return this.beginRound()
  }

  restart(): Promise<GameState> {
    wordBankService.reset()
    analyticsService.reset()
    return this.start({ maxRounds: this.maxRounds })
  }
}

export const flashcardGameEngine = new FlashcardGameEngine()
