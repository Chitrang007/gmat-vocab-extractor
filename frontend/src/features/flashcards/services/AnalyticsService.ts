import type { ModeId, RoundResult, SessionStats } from '../types/flashcard.types'

export class AnalyticsService {
  private events: RoundResult[] = []

  trackRound(result: RoundResult): void {
    this.events.push(result)
  }

  trackSessionEnd(stats: SessionStats): void {
    if (import.meta.env.DEV) {
      console.info('[Flashcards Analytics] Session complete', stats)
    }
  }

  getEvents(): RoundResult[] {
    return [...this.events]
  }

  reset(): void {
    this.events = []
  }
}

export function createEmptySessionStats(): SessionStats {
  return {
    score: 0,
    total: 0,
    accuracy: 0,
    accuracyByWord: {},
    modeBreakdown: {} as Record<ModeId, { attempts: number; correct: number }>,
  }
}

export function updateSessionStats(
  stats: SessionStats,
  result: RoundResult,
): SessionStats {
  const next = { ...stats }
  next.total += 1
  if (result.evaluation.isCorrect) {
    next.score += 1
  }
  next.accuracy = next.total > 0 ? next.score / next.total : 0

  const wordStats = next.accuracyByWord[result.word] ?? { attempts: 0, correct: 0 }
  next.accuracyByWord[result.word] = {
    attempts: wordStats.attempts + 1,
    correct: wordStats.correct + (result.evaluation.isCorrect ? 1 : 0),
  }

  const modeStats = next.modeBreakdown[result.modeId] ?? { attempts: 0, correct: 0 }
  next.modeBreakdown[result.modeId] = {
    attempts: modeStats.attempts + 1,
    correct: modeStats.correct + (result.evaluation.isCorrect ? 1 : 0),
  }

  return next
}

export const analyticsService = new AnalyticsService()
