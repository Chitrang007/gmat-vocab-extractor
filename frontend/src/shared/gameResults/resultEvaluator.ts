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
  image?: string
}

function getRandomAsset(category: keyof typeof resultAssets) {
  const assets = resultAssets[category];
  return assets[Math.floor(Math.random() * assets.length)];
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
      image: getRandomAsset("perfect"),
    }
  }

  if (ratio >= 0.8) {
    return {
      ratio,
      category: "great",
      message: getAboveAverageAchievement(),
      image: getRandomAsset("great"),
    }
  }

  if (ratio >= 0.5) {
    return {
      ratio,
      category: "average",
      message: getAverageAchievement(),
      image: getRandomAsset("average"),
    }
  }

  return {
    ratio,
    category: "roasted",
    message: getRandomRoast(),
    image: getRandomAsset("roasted"),
  }
}