/**
 * Feature Extraction Service
 * Captures behavioral signals during answering to feed into ML confidence model
 */

export interface BehavioralFeatures {
  response_time: number // seconds until first meaningful answer
  revisions: number // number of times answer was edited
  explanation_length: number // character count of explanation
  explanation_depth: "shallow" | "medium" | "deep" // assessed from text analysis
  concept_coverage: number // 0-100: estimated % of key points covered
  consistency_score: number // 0-100: consistency with related questions
  application_success: boolean // whether applied reasoning correctly
  time_to_first_word: number // seconds until first keystroke
  answer_confidence_alignment: number // -100 to 100: how well self-confidence matches correctness
}

export interface FeatureExtractionRaw {
  initial_answer_time: number
  edit_count: number
  final_text: string
  is_correct: boolean
  self_confidence: number
  related_question_indices: number[]
}

/**
 * Extract depth from explanation text using simple heuristics
 * shallow: definitions only, surface-level
 * medium: some reasoning, examples
 * deep: multi-step reasoning, nuanced, edge cases
 */
export function estimateExplanationDepth(text: string): "shallow" | "medium" | "deep" {
  const hasMultipleSteps = /step|first|second|third|then|moreover|furthermore/.test(text.toLowerCase())
  const hasExample = /example|such as|for instance|case/.test(text.toLowerCase())
  const hasNuance = /however|but|edge case|depends|context|tradeoff/.test(text.toLowerCase())
  const hasCounterpoint = /wrong|incorrect|common mistake|avoid/.test(text.toLowerCase())

  const signals = [hasMultipleSteps, hasExample, hasNuance, hasCounterpoint].filter(Boolean).length

  if (signals >= 3) return "deep"
  if (signals >= 2 || hasExample) return "medium"
  return "shallow"
}

/**
 * Estimate concept coverage using keyword matching
 * This is a simplified version; in production, use NLP
 */
export function estimateConceptCoverage(
  explanation: string,
  question: string,
  conceptKeywords: string[] = []
): number {
  const text = (explanation + " " + question).toLowerCase()
  
  // Default keywords if not provided
  const keywords = conceptKeywords.length > 0 ? conceptKeywords : extractKeywords(question)

  if (keywords.length === 0) return 50 // neutral default

  const matchedCount = keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length
  const coverage = Math.min((matchedCount / keywords.length) * 100, 100)

  return Math.round(coverage)
}

/**
 * Simple keyword extraction from question text
 */
function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "is",
    "was",
    "are",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
  ])

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w))
    .slice(0, 10) // top 10 most relevant-looking words

  return words
}

/**
 * Calculate consistency score between two related answers
 * High consistency: similar depth, both correct or both incorrect
 * Low consistency: one deep/one shallow, one correct/one incorrect
 */
export function calculateConsistencyScore(
  currentDepth: "shallow" | "medium" | "deep",
  previousDepths: ("shallow" | "medium" | "deep")[],
  currentCorrect: boolean,
  previousCorrect: boolean[]
): number {
  if (previousDepths.length === 0) return 50 // neutral if no prior questions

  // Depth consistency: 0-50 points
  const depthMap = { shallow: 0, medium: 1, deep: 2 }
  const avgPreviousDepth = previousDepths.reduce((sum, d) => sum + depthMap[d], 0) / previousDepths.length
  const currentDepthVal = depthMap[currentDepth]
  const depthDiff = Math.abs(currentDepthVal - avgPreviousDepth)
  const depthScore = Math.max(0, 50 - depthDiff * 25)

  // Correctness consistency: 0-50 points
  const correctRate = previousCorrect.filter(Boolean).length / previousCorrect.length
  const currentMatches = currentCorrect === (correctRate > 0.5)
  const correctScore = currentMatches ? 50 : 25

  return Math.round(depthScore + correctScore)
}

/**
 * Compute alignment between self-reported confidence and actual correctness
 * Returns -100 (overconfident) to +100 (well-calibrated)
 */
export function calculateConfidenceAlignment(
  selfConfidence: number, // 0-100
  isCorrect: boolean,
  previousAlignments: number[] = []
): number {
  const confidenceThreshold = 50
  const isHighConfidence = selfConfidence >= confidenceThreshold

  // Perfect alignment cases
  if (isHighConfidence && isCorrect) {
    return 100 // well-calibrated confidence
  }
  if (!isHighConfidence && !isCorrect) {
    return 100 // well-calibrated low confidence
  }

  // Misalignment cases
  if (isHighConfidence && !isCorrect) {
    // Overconfidence: penalty based on how high confidence was
    return Math.max(-100, -50 - (selfConfidence - 50) / 2)
  }

  // Underconfidence: minor penalty
  return Math.max(-50, -30 + selfConfidence / 3)
}

/**
 * Aggregate features into structured behavioral profile
 */
export function extractFeatures(raw: FeatureExtractionRaw, questionContext: any = {}): BehavioralFeatures {
  const depthEstimate = estimateExplanationDepth(raw.final_text)
  const coverageEstimate = estimateConceptCoverage(raw.final_text, questionContext.question || "", [])
  const alignmentScore = calculateConfidenceAlignment(raw.self_confidence, raw.is_correct)

  return {
    response_time: Math.round(raw.initial_answer_time / 1000), // convert ms to seconds
    revisions: raw.edit_count,
    explanation_length: raw.final_text.length,
    explanation_depth: depthEstimate,
    concept_coverage: coverageEstimate,
    consistency_score: 50, // will be computed after multiple questions
    application_success: raw.is_correct && depthEstimate !== "shallow",
    time_to_first_word: Math.round(raw.initial_answer_time / 1000),
    answer_confidence_alignment: alignmentScore,
  }
}
