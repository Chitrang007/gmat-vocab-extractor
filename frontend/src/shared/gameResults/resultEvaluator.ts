import { getAboveAverageAchievement, getAverageAchievement, getPerfectAchievement } from "./achievementMessages"
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
  image: string
}

const gifCounters: Record<string, number> = {}

function getCycledAsset(category: keyof typeof resultAssets, key: string) {
  const assets = resultAssets[category]

  if (!gifCounters[key]) {
    gifCounters[key] = 0
  }

  const index = gifCounters[key] % assets.length
  gifCounters[key] += 1

  return assets[index]
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
      message: getPerfectAchievement(),
      image: getCycledAsset("perfect", "perfect"),
    }
  }

  if (ratio >= 0.8) {
    return {
      ratio,
      category: "great",
      message: getAboveAverageAchievement(),
      image: getCycledAsset("great", "great"),
    }
  }

  if (ratio >= 0.5) {
    return {
      ratio,
      category: "average",
      message: getAverageAchievement(),
      image: getCycledAsset("average", "average"),
    }
  }

  return {
    ratio,
    category: "roasted",
    message: getRandomRoast(),
    image: getCycledAsset("roasted", "roasted"),
  }
}