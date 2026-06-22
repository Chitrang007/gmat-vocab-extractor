import { FLASHCARD_MODES, getEligibleModes, getModeById } from '../constants/flashcardModes'
import type { ModeDefinition, ModeId, Round, Word } from '../types/flashcard.types'
import { createRoundId } from '../../../utils/stringNormalize'

export class FlashcardModesService {
  getAllModes(): ModeDefinition[] {
    return FLASHCARD_MODES
  }

  getEligibleModes(word: Word): ModeDefinition[] {
    return getEligibleModes(word)
  }

  pickRandomMode(word: Word, excludeModeId?: ModeId): ModeDefinition {
    const eligible = getEligibleModes(word).filter(
      (mode) => mode.id !== excludeModeId,
    )
    const pool = eligible.length > 0 ? eligible : getEligibleModes(word)
    if (pool.length === 0) {
      throw new Error(`No eligible modes for word: ${word.word}`)
    }
    return pool[Math.floor(Math.random() * pool.length)]
  }

  buildRound(word: Word, roundIndex: number, modeId?: ModeId): Round {
    const mode = modeId ? getModeById(modeId) : this.pickRandomMode(word)
    if (!mode || !mode.isEligible(word)) {
      throw new Error(`Mode unavailable for word: ${word.word}`)
    }

    return {
      roundId: createRoundId(),
      roundIndex,
      word,
      mode,
      prompt: mode.getPrompt(word),
      expectedAnswers: mode.getExpectedAnswers(word),
      acceptSynonyms: mode.acceptSynonyms ?? false,
      startedAt: Date.now(),
    }
  }
}

export const flashcardModesService = new FlashcardModesService()
