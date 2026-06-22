import { getRandomRoast } from "./roastMessages"
import { resultAssets } from "./resultAssets"

export type ResultCategory =
  | "perfect"
  | "great"
  | "average"
  | "roasted"

export interface GameResult {
  ratio: number
  category: ResultCategory
  message: string
  image?: string
}

export function evaluateResult(
  score: number,
  totalQuestions: number
): GameResult {
  const ratio = score / totalQuestions

  if (ratio === 1) {
    return {
      ratio,
      category: "perfect",
      message: "Perfect score!",
    }
  }

  if (ratio >= 0.8) {
    return {
      ratio,
      category: "great",
      message: "Great job!",
    }
  }

  if (ratio >= 0.5) {
    return {
      ratio,
      category: "average",
      message: "Keep Practicing!",
    }
  }

  return {
    ratio,
    category: "roasted",
    message: getRandomRoast(),
    image: resultAssets.roasted,
  }
}