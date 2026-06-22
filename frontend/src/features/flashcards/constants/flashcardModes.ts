import type { ModeDefinition, Word } from '../types/flashcard.types'

function pickRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export const FLASHCARD_MODES: ModeDefinition[] = [
  {
    id: 'WORD_TO_DEFINITION',
    label: 'Word → Definition',
    promptLabel: 'Say the definition for this word:',
    getPrompt: (word) => word.word,
    getExpectedAnswers: (word) => [word.definition],
    isEligible: (word) => Boolean(word.definition?.trim()),
    acceptSynonyms: false,
  },
  {
    id: 'DEFINITION_TO_WORD',
    label: 'Definition → Word',
    promptLabel: 'What word matches this definition?',
    getPrompt: (word) => word.definition,
    getExpectedAnswers: (word) => [word.word],
    isEligible: (word) => Boolean(word.definition?.trim() && word.word?.trim()),
    acceptSynonyms: true,
  },
  {
    id: 'EXAMPLE_TO_WORD',
    label: 'Example → Word',
    promptLabel: 'What word fits this example sentence?',
    getPrompt: (word) => word.contextSentence,
    getExpectedAnswers: (word) => [word.word],
    isEligible: (word) => Boolean(word.contextSentence?.trim() && word.word?.trim()),
    acceptSynonyms: true,
  },
  {
    id: 'SYNONYM_TO_WORD',
    label: 'Synonym → Word',
    promptLabel: 'What word has this synonym?',
    getPrompt: (word) => pickRandomItem(word.synonyms),
    getExpectedAnswers: (word) => [word.word],
    isEligible: (word) => word.synonyms?.length > 0 && Boolean(word.word?.trim()),
    acceptSynonyms: false,
  },
  {
    id: 'ANTONYM_TO_WORD',
    label: 'Antonym → Word',
    promptLabel: 'What word is the opposite of this antonym?',
    getPrompt: (word) => pickRandomItem(word.antonyms),
    getExpectedAnswers: (word) => [word.word],
    isEligible: (word) => word.antonyms?.length > 0 && Boolean(word.word?.trim()),
    acceptSynonyms: false,
  },
]

export function getModeById(id: string): ModeDefinition | undefined {
  return FLASHCARD_MODES.find((mode) => mode.id === id)
}

export function getEligibleModes(word: Word): ModeDefinition[] {
  return FLASHCARD_MODES.filter((mode) => mode.isEligible(word))
}
