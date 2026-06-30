import { FUZZY_PARTIAL_THRESHOLD, FUZZY_THRESHOLD } from '../constants/gameConfig'
import type { EvaluationResult, MatchType, Round } from '../types/flashcard.types'
import { normalizeText } from '../../../utils/stringNormalize'

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarityScore(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const distance = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

function buildFeedback(
  matchType: MatchType,
  score: number,
  isCorrect: boolean,
  expected: string,
): string {
  if (matchType === "exact") {
    return "Perfect match!";
  }
  if (matchType === "accepted") {
    return `Correct! Your answer is accepted. The expected answer is "${expected}".`;
  }
  if (matchType === "synonym") {
    return "Accepted as a valid synonym.";
  }
  if (matchType === "nearMiss") {
    return `Almost! The expected answer was "${expected}".`;
  }
  if (matchType === "fuzzy" && isCorrect) {
    return "Close enough — minor spelling or speech variation detected.";
  }
  if (score >= 5) {
    return `Getting warm. The expected answer was "${expected}".`;
  }
  if (score > 0) {
    return `Not quite. You were partially close to "${expected}".`;
  }
  return `Incorrect. The expected answer was "${expected}".`;
}

function scoreFromMatch(
  matchType: MatchType,
  confidence: number,
  isCorrect: boolean,
): number {
  if (matchType === "exact") return 10;
  if (matchType === "accepted") return 10;
  if (matchType === "synonym") return 9;
  if (matchType === "nearMiss") return 7;
  if (matchType === "fuzzy" && isCorrect) {
    if (confidence >= 0.92) return 8;
    if (confidence >= FUZZY_THRESHOLD) return 7;
    return 6;
  }
  if (confidence >= FUZZY_PARTIAL_THRESHOLD) return 4;
  if (confidence >= 0.6) return 2;
  return 0;
}

export class AnswerEvaluator {
  evaluate(input: string, round: Round): EvaluationResult {
    const normalizedInput = normalizeText(input);
    const normalizedExpectedList = round.expectedAnswers.map(normalizeText);
    const primaryExpected = normalizedExpectedList[0] ?? "";

    if (!normalizedInput) {
      return {
        isCorrect: false,
        score: 0,
        matchType: "none",
        confidence: 0,
        feedback: "No answer provided.",
        normalizedInput,
        normalizedExpected: primaryExpected,
      };
    }

    if (normalizedExpectedList.includes(normalizedInput)) {
      return {
        isCorrect: true,
        score: 10,
        matchType: "exact",
        confidence: 1,
        feedback: buildFeedback("exact", 10, true, primaryExpected),
        normalizedInput,
        normalizedExpected: primaryExpected,
      };
    }

    const normalizedAcceptedAnswers =
      round.word.acceptedAnswers?.map(normalizeText) ?? [];

    if (normalizedAcceptedAnswers.includes(normalizedInput)) {
      const score = scoreFromMatch("accepted", 1, true);
      return {
        isCorrect: true,
        score,
        matchType: "accepted",
        confidence: 1,
        feedback: buildFeedback("accepted", score, true, primaryExpected),
        normalizedInput,
        normalizedExpected: primaryExpected,
      };
    }

    if (round.acceptSynonyms && round.word.synonyms?.length) {
      const synonymMatches = round.word.synonyms
        .map(normalizeText)
        .includes(normalizedInput);
      if (synonymMatches) {
        return {
          isCorrect: true,
          score: 9,
          matchType: "synonym",
          confidence: 0.95,
          feedback: buildFeedback("synonym", 9, true, primaryExpected),
          normalizedInput,
          normalizedExpected: primaryExpected,
        };
      }
    }

    const normalizedNearMissAnswers =
      round.word.nearMissAnswers?.map(normalizeText) ?? [];

    if (normalizedNearMissAnswers.includes(normalizedInput)) {
      const score = scoreFromMatch("nearMiss", 1, false);
      return {
        isCorrect: false,
        score,
        matchType: "nearMiss",
        confidence: 1,
        feedback: buildFeedback("nearMiss", score, false, primaryExpected),
        normalizedInput,
        normalizedExpected: primaryExpected,
      };
    }

    const fuzzyCandidates = [
      ...new Set([...normalizedExpectedList, ...normalizedAcceptedAnswers]),
    ];
    let bestConfidence = 0;
    for (const expected of fuzzyCandidates) {
      bestConfidence = Math.max(
        bestConfidence,
        similarityScore(normalizedInput, expected),
      );
    }

    const isCorrect = bestConfidence >= FUZZY_THRESHOLD;
    const matchType: MatchType = isCorrect
      ? "fuzzy"
      : bestConfidence >= FUZZY_PARTIAL_THRESHOLD
        ? "fuzzy"
        : "none";
    const score = scoreFromMatch(matchType, bestConfidence, isCorrect);

    return {
      isCorrect,
      score,
      matchType,
      confidence: bestConfidence,
      feedback: buildFeedback(matchType, score, isCorrect, primaryExpected),
      normalizedInput,
      normalizedExpected: primaryExpected,
    };
  }
}

export const answerEvaluator = new AnswerEvaluator();
