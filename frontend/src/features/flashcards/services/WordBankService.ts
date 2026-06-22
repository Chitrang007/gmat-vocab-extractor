import { getWords } from '../../../api/index.js'
import { MIN_WORDS } from '../constants/gameConfig'
import { getEligibleModes } from '../constants/flashcardModes'
import type { Word } from '../types/flashcard.types'
import { shuffleArray } from '../../../utils/stringNormalize'

export class WordBankService {
  private words: Word[] = []
  private index = 0

  async load(): Promise<Word[]> {
    const data = (await getWords()) as Word[]
    this.words = shuffleArray(
      data.filter((word) => word.word?.trim() && getEligibleModes(word).length > 0),
    )
    this.index = 0
    return this.words
  }

  hasMinimumWords(min = MIN_WORDS): boolean {
    return this.words.length >= min
  }

  getCount(): number {
    return this.words.length
  }

  next(): Word | null {
    if (this.index >= this.words.length) {
      return null
    }
    const word = this.words[this.index]
    this.index += 1
    return word
  }

  peek(): Word | null {
    if (this.index >= this.words.length) {
      return null
    }
    return this.words[this.index]
  }

  reset(): void {
    this.index = 0
    this.words = shuffleArray(this.words)
  }

  getAll(): Word[] {
    return [...this.words]
  }
}

export const wordBankService = new WordBankService()
