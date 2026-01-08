// Confidence scoring logic implementing the exact 4-phase algorithm

export interface QuestionMetadata {
  question_id: string
  is_correct: boolean
  total_time: number // seconds
  user_confidence: number // 0-100
  topic: string
}

export interface ConfidenceResult {
  final_confidence: number // 0-1, rounded to 2 decimals
  base_score: number
  adjusted_score: number
  z_score: number
  category: "Strong Confidence" | "Moderate Confidence" | "Needs Clarity"
}

// Population parameters (can be adjusted based on domain calibration)
const READING_TIME = 20 // seconds
const MEAN_EFFECTIVE = 45 // mean effective time from population
const STD_EFFECTIVE = 20 // standard deviation from population

/**
 * Phase 1: Time Normalization
 */
function normalizeTime(totalTime: number): number {
  return Math.max(totalTime - READING_TIME, 0)
}

/**
 * Phase 2: Rule-Based Base Scoring
 */
function computeBaseScore(isCorrect: boolean, effectiveTime: number): number {
  if (!isCorrect) return 0.0
  if (effectiveTime < 10) return 1.0
  return 0.75
}

/**
 * Phase 3: Sigma (Peer) Adjustment
 */
function computeSigmaMultiplier(effectiveTime: number): number {
  const zScore = (effectiveTime - MEAN_EFFECTIVE) / STD_EFFECTIVE

  if (zScore < -1) return 1.05 // Fast outlier
  if (zScore > 1) return 0.9 // Slow outlier
  return 1.0 // Average
}

/**
 * Phase 4: Final Calculation
 * Compute confidence score for a single question
 */
export function computeQuestionConfidence(metadata: QuestionMetadata): ConfidenceResult {
  // Phase 1
  const effectiveTime = normalizeTime(metadata.total_time)

  // Phase 2
  const baseScore = computeBaseScore(metadata.is_correct, effectiveTime)

  // Phase 3
  const multiplier = computeSigmaMultiplier(effectiveTime)
  const adjustedScore = baseScore * multiplier

  // Phase 4
  const finalConfidence = Math.round(Math.min(Math.max(adjustedScore, 0), 1) * 100) / 100

  // Z-score for reporting
  const zScore = (effectiveTime - MEAN_EFFECTIVE) / STD_EFFECTIVE

  // Categorize
  const percentage = finalConfidence * 100
  let category: "Strong Confidence" | "Moderate Confidence" | "Needs Clarity"
  if (percentage >= 85) category = "Strong Confidence"
  else if (percentage >= 65) category = "Moderate Confidence"
  else category = "Needs Clarity"

  return {
    final_confidence: finalConfidence,
    base_score: baseScore,
    adjusted_score: adjustedScore,
    z_score: Math.round(zScore * 100) / 100,
    category,
  }
}

/**
 * Compute aggregate confidence across all questions
 */
export function computeOverallConfidence(questions: QuestionMetadata[]): {
  overall_score: number
  topic_scores: Record<string, { score: number; count: number; category: string }>
  average_time: number
  consistency_score: number
} {
  if (questions.length === 0) {
    return {
      overall_score: 0,
      topic_scores: {},
      average_time: 0,
      consistency_score: 0,
    }
  }

  const results = questions.map(computeQuestionConfidence)
  const overallScore = results.reduce((sum, r) => sum + r.final_confidence, 0) / results.length

  // Group by topic
  const topicScores: Record<string, { score: number; count: number; category: string }> = {}
  questions.forEach((q, idx) => {
    if (!topicScores[q.topic]) {
      topicScores[q.topic] = { score: 0, count: 0, category: "" }
    }
    topicScores[q.topic].score += results[idx].final_confidence
    topicScores[q.topic].count += 1
  })

  // Compute averages and categories
  Object.keys(topicScores).forEach((topic) => {
    const avg = topicScores[topic].score / topicScores[topic].count
    topicScores[topic].score = Math.round(avg * 100) / 100
    const percentage = avg * 100
    if (percentage >= 85) topicScores[topic].category = "Strong"
    else if (percentage >= 65) topicScores[topic].category = "Moderate"
    else topicScores[topic].category = "Needs Clarity"
  })

  // Average response time
  const averageTime =
    questions.reduce((sum, q) => sum + q.total_time, 0) / questions.length

  // Consistency Score: alignment between confidence and correctness
  let alignmentCount = 0
  questions.forEach((q) => {
    const isHighConfidence = q.user_confidence >= 70
    if ((isHighConfidence && q.is_correct) || (!isHighConfidence && !q.is_correct)) {
      alignmentCount++
    }
  })
  const consistencyScore = Math.round((alignmentCount / questions.length) * 100)

  return {
    overall_score: Math.round(overallScore * 100) / 100,
    topic_scores: topicScores,
    average_time: Math.round(averageTime * 10) / 10,
    consistency_score: consistencyScore,
  }
}

/**
 * Generate behavioral insights based on metadata patterns
 */
export function generateBehavioralInsights(
  questions: QuestionMetadata[],
  aggregates: ReturnType<typeof computeOverallConfidence>
): string[] {
  const insights: string[] = []

  // Time-to-Thought Mapping
  if (aggregates.average_time > 60) {
    insights.push(
      "You took time to think through answers carefully, indicating reflective reasoning."
    )
  } else if (aggregates.average_time < 30) {
    insights.push(
      "Your quick response times suggest strong intuitive understanding or pattern recognition."
    )
  }

  // Consistency Logic
  if (aggregates.consistency_score >= 80) {
    insights.push(
      `Consistency Score: ${aggregates.consistency_score}% - Your self-assessment aligns well with your actual performance.`
    )
  } else if (aggregates.consistency_score < 60) {
    const overconfident = questions.filter((q) => q.user_confidence >= 70 && !q.is_correct)
    const underconfident = questions.filter((q) => q.user_confidence < 50 && q.is_correct)

    if (overconfident.length > underconfident.length) {
      insights.push(
        `Consistency Score: ${aggregates.consistency_score}% - High confidence with some incorrect answers indicates areas for calibration.`
      )
    } else if (underconfident.length > overconfident.length) {
      insights.push(
        `Consistency Score: ${aggregates.consistency_score}% - Low confidence despite correct answers suggests underestimation of your abilities.`
      )
    } else {
      insights.push(
        `Consistency Score: ${aggregates.consistency_score}% - Varied confidence-correctness alignment indicates room for self-awareness improvement.`
      )
    }
  }

  // Fluctuation Detection
  const topicScoreValues = Object.values(aggregates.topic_scores).map((t) => t.score)
  if (topicScoreValues.length > 1) {
    const variance =
      topicScoreValues.reduce((sum, score) => {
        const mean = aggregates.overall_score
        return sum + Math.pow(score - mean, 2)
      }, 0) / topicScoreValues.length

    if (variance > 0.1) {
      insights.push(
        "Your confidence fluctuated across topics. Exploring edge cases could stabilize understanding."
      )
    }
  }

  // Clarity Zones
  const needsClarityTopics = Object.entries(aggregates.topic_scores)
    .filter(([_, data]) => data.category === "Needs Clarity")
    .map(([topic, _]) => topic)

  if (needsClarityTopics.length > 0) {
    insights.push(
      `Focus next on the 'Needs Clarity' sections (${needsClarityTopics.join(", ")}) to strengthen foundational understanding.`
    )
  }

  // Reasoning Validation
  const correctWithLongTime = questions.filter(
    (q) => q.is_correct && q.total_time - READING_TIME > 30
  )
  if (correctWithLongTime.length >= questions.length / 3) {
    insights.push(
      "Many correct answers came after extended thinking, validating your methodical problem-solving approach."
    )
  }

  return insights
}

/**
 * Generate final adaptive message based on overall performance
 */
export function generateAdaptiveMessage(overallScore: number): string {
  const percentage = overallScore * 100

  if (percentage >= 80) {
    return "Excellent work! Your confidence and accuracy show strong conceptual mastery."
  } else if (percentage >= 60) {
    return "Good progress. With targeted refinement in a few areas, your confidence will significantly improve."
  } else {
    return "You're building understanding. Revisiting core concepts and practicing edge cases will boost clarity."
  }
}
