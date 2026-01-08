/**
 * ML-Inspired Confidence Scorer
 * Generates multi-dimensional confidence profiles based on extracted behavioral features
 */

import type { BehavioralFeatures } from "./feature-extractor"

export interface ConfidenceDimension {
  name: "Concept Clarity" | "Logical Confidence" | "Application Confidence" | "Industry Readiness"
  score: number // 0-100
  label: "Strong" | "Moderate" | "Needs Clarity"
  explanation: string
}

export interface MLConfidenceProfile {
  overall_score: number // 0-100 weighted average
  dimensions: ConfidenceDimension[]
  behavior_summary: string
  recommendations: string[]
  confidence_trend: "improving" | "declining" | "stable"
}

/**
 * Convert dimension score to human-readable label
 */
function scoreToLabel(score: number): "Strong" | "Moderate" | "Needs Clarity" {
  if (score >= 70) return "Strong"
  if (score >= 40) return "Moderate"
  return "Needs Clarity"
}

/**
 * Calculate Concept Clarity dimension
 * Based on: explanation_depth, concept_coverage, time patterns
 * Signal: Deep explanations with good concept coverage = clarity
 */
function calculateConceptClarity(features: BehavioralFeatures[]): ConfidenceDimension {
  if (features.length === 0) {
    return {
      name: "Concept Clarity",
      score: 50,
      label: "Moderate",
      explanation: "Not enough data to assess concept clarity",
    }
  }

  // Weight calculation
  const depthScores = features.map((f) => {
    const depthMap = { shallow: 20, medium: 60, deep: 100 }
    return depthMap[f.explanation_depth]
  })
  const avgDepth = depthScores.reduce((a, b) => a + b, 0) / depthScores.length
  const coverageScore = features.reduce((sum, f) => sum + f.concept_coverage, 0) / features.length
  const timeConsistency = features.length > 1 ? 50 : 75 // more questions = better signal

  // Combined score: 40% depth, 40% coverage, 20% time consistency
  const score = Math.round(avgDepth * 0.4 + coverageScore * 0.4 + timeConsistency * 0.2)

  return {
    name: "Concept Clarity",
    score: Math.min(100, Math.max(0, score)),
    label: scoreToLabel(score),
    explanation:
      score >= 70
        ? "You demonstrate clear understanding of core concepts with well-structured explanations."
        : score >= 40
          ? "You show basic understanding but could deepen your explanations with more detail."
          : "Consider reviewing fundamental concepts to improve clarity.",
  }
}

/**
 * Calculate Logical Confidence dimension
 * Based on: consistency_score, response_time patterns, correctness alignment
 * Signal: Consistent performance and aligned confidence = logical confidence
 */
function calculateLogicalConfidence(features: BehavioralFeatures[]): ConfidenceDimension {
  if (features.length === 0) {
    return {
      name: "Logical Confidence",
      score: 50,
      label: "Moderate",
      explanation: "Not enough data to assess logical confidence",
    }
  }

  const consistencyScore = features.reduce((sum, f) => sum + f.consistency_score, 0) / features.length
  const alignmentScores = features.map((f) => {
    // Convert alignment score (-100 to 100) to 0-100 scale
    return (f.answer_confidence_alignment + 100) / 2
  })
  const avgAlignment = alignmentScores.reduce((a, b) => a + b, 0) / alignmentScores.length

  // Combined: 50% consistency, 50% alignment
  const score = Math.round(consistencyScore * 0.5 + avgAlignment * 0.5)

  return {
    name: "Logical Confidence",
    score: Math.min(100, Math.max(0, score)),
    label: scoreToLabel(score),
    explanation:
      score >= 70
        ? "Your reasoning is consistent and well-calibrated with actual performance."
        : score >= 40
          ? "You show some consistency, but could improve alignment between confidence and actual correctness."
          : "Consider being more self-aware about what you know vs. don't know.",
  }
}

/**
 * Calculate Application Confidence dimension
 * Based on: application_success rate, explanation_length, time patterns
 * Signal: Successfully applying concepts to problems = application confidence
 */
function calculateApplicationConfidence(
  features: BehavioralFeatures[],
  correctnessRates: number[]
): ConfidenceDimension {
  if (features.length === 0) {
    return {
      name: "Application Confidence",
      score: 50,
      label: "Moderate",
      explanation: "Not enough data to assess application confidence",
    }
  }

  const applicationScore = features.reduce((sum, f) => sum + (f.application_success ? 100 : 0), 0) / features.length
  const correctnessScore = correctnessRates.length > 0 ? (correctnessRates.filter(Boolean).length / correctnessRates.length) * 100 : 50

  // Explanation length signals thoroughness
  const avgExplanationLength = features.reduce((sum, f) => sum + f.explanation_length, 0) / features.length
  const lengthScore = Math.min(100, (avgExplanationLength / 500) * 100) // normalize to typical explanation length

  // Combined: 40% application, 40% correctness, 20% explanation quality
  const score = Math.round(applicationScore * 0.4 + correctnessScore * 0.4 + lengthScore * 0.2)

  return {
    name: "Application Confidence",
    score: Math.min(100, Math.max(0, score)),
    label: scoreToLabel(score),
    explanation:
      score >= 70
        ? "You successfully apply concepts to real-world scenarios and problems."
        : score >= 40
          ? "You can apply concepts in some situations, but could improve with more practice."
          : "Focus on connecting theory to practical applications.",
  }
}

/**
 * Calculate Industry Readiness dimension
 * Based on: overall performance, depth, time management, consistency
 * Signal: Professional-level understanding and communication
 */
function calculateIndustryReadiness(
  features: BehavioralFeatures[],
  correctnessRates: number[]
): ConfidenceDimension {
  if (features.length === 0) {
    return {
      name: "Industry Readiness",
      score: 50,
      label: "Moderate",
      explanation: "Not enough data to assess industry readiness",
    }
  }

  // Key signals
  const depthScores = features.map((f) => {
    const depthMap = { shallow: 0, medium: 50, deep: 100 }
    return depthMap[f.explanation_depth]
  })
  const avgDepth = depthScores.reduce((a, b) => a + b, 0) / depthScores.length

  const correctnessRate = correctnessRates.length > 0 ? (correctnessRates.filter(Boolean).length / correctnessRates.length) * 100 : 50

  // Time management: ideal is balanced (not too rushed, not too slow)
  const avgResponseTime = features.reduce((sum, f) => sum + f.response_time, 0) / features.length
  const timeScore = avgResponseTime < 10 ? 50 : avgResponseTime < 30 ? 80 : avgResponseTime < 60 ? 60 : 40

  // Low revision count signals confidence
  const avgRevisions = features.reduce((sum, f) => sum + f.revisions, 0) / features.length
  const revisionScore = avgRevisions < 2 ? 80 : avgRevisions < 4 ? 60 : 40

  // Combined: 30% depth, 30% correctness, 20% time, 20% revisions
  const score = Math.round(
    avgDepth * 0.3 + correctnessRate * 0.3 + timeScore * 0.2 + revisionScore * 0.2
  )

  return {
    name: "Industry Readiness",
    score: Math.min(100, Math.max(0, score)),
    label: scoreToLabel(score),
    explanation:
      score >= 70
        ? "You demonstrate professional-level understanding ready for industry application."
        : score >= 40
          ? "You're developing industry skills but would benefit from more depth and consistency."
          : "Continue building expertise to meet industry standards.",
  }
}

/**
 * Generate behavioral summary from features
 */
function generateBehaviorSummary(features: BehavioralFeatures[]): string {
  if (features.length === 0) return "No assessment data available."

  const avgResponseTime = features.reduce((sum, f) => sum + f.response_time, 0) / features.length
  const totalRevisions = features.reduce((sum, f) => sum + f.revisions, 0)
  const deepCount = features.filter((f) => f.explanation_depth === "deep").length
  const shallowCount = features.filter((f) => f.explanation_depth === "shallow").length

  let summary = ""

  // Response time pattern
  if (avgResponseTime < 10) {
    summary += "You answer quickly, which might indicate confidence or rushing. "
  } else if (avgResponseTime < 30) {
    summary += "Your response time is well-balanced for thoughtful analysis. "
  } else {
    summary += "You take significant time to answer, suggesting careful deliberation. "
  }

  // Revision pattern
  if (totalRevisions === 0) {
    summary += "You rarely revise your answers, showing confidence in your initial responses. "
  } else if (totalRevisions < features.length) {
    summary += "You occasionally refine your answers, showing thoughtful editing. "
  } else {
    summary += "You frequently revise your answers, suggesting you're refining your thinking. "
  }

  // Depth pattern
  if (deepCount > features.length / 2) {
    summary += "Most of your explanations are thorough and well-reasoned."
  } else if (shallowCount > features.length / 2) {
    summary += "Your explanations tend to be brief; consider providing more detail."
  } else {
    summary += "Your explanations show mixed depth levels."
  }

  return summary
}

/**
 * Generate recommendations based on profile
 */
function generateRecommendations(
  dimensions: ConfidenceDimension[],
  features: BehavioralFeatures[]
): string[] {
  const recommendations: string[] = []

  // Find weakest dimension
  const weakest = dimensions.reduce((min, d) => (d.score < min.score ? d : min))

  if (weakest.score < 50) {
    if (weakest.name === "Concept Clarity") {
      recommendations.push("Review fundamental concepts to improve clarity and depth.")
    } else if (weakest.name === "Logical Confidence") {
      recommendations.push("Work on calibrating your confidence with actual performance.")
    } else if (weakest.name === "Application Confidence") {
      recommendations.push("Practice applying concepts to real-world scenarios.")
    } else if (weakest.name === "Industry Readiness") {
      recommendations.push("Focus on professional-level understanding and communication.")
    }
  }

  // Check for speed issues
  const avgResponseTime = features.reduce((sum, f) => sum + f.response_time, 0) / features.length
  if (avgResponseTime < 8) {
    recommendations.push("Consider slowing down to provide more detailed responses.")
  }

  // Check for revision patterns
  const avgRevisions = features.reduce((sum, f) => sum + f.revisions, 0) / features.length
  if (avgRevisions > 3) {
    recommendations.push("Try to be more decisive in your initial responses.")
  }

  // Always include growth recommendation
  recommendations.push("Continue practicing to deepen your expertise.")

  return recommendations.slice(0, 3) // Limit to 3 recommendations
}

/**
 * Calculate confidence trend (improving, declining, or stable)
 */
function calculateTrend(features: BehavioralFeatures[]): "improving" | "declining" | "stable" {
  if (features.length < 3) return "stable"

  // Compare first half vs second half
  const mid = Math.floor(features.length / 2)
  const firstHalf = features.slice(0, mid)
  const secondHalf = features.slice(mid)

  const firstHalfScore =
    firstHalf.reduce((sum, f) => sum + f.concept_coverage, 0) / firstHalf.length
  const secondHalfScore =
    secondHalf.reduce((sum, f) => sum + f.concept_coverage, 0) / secondHalf.length

  const difference = secondHalfScore - firstHalfScore
  if (difference > 5) return "improving"
  if (difference < -5) return "declining"
  return "stable"
}

/**
 * Main function: Generate multi-dimensional ML confidence profile
 */
export function generateConfidenceProfile(
  features: BehavioralFeatures[],
  correctnessRates: number[] = []
): MLConfidenceProfile {
  // Calculate all dimensions
  const conceptClarity = calculateConceptClarity(features)
  const logicalConfidence = calculateLogicalConfidence(features)
  const applicationConfidence = calculateApplicationConfidence(features, correctnessRates)
  const industryReadiness = calculateIndustryReadiness(features, correctnessRates)

  const dimensions = [conceptClarity, logicalConfidence, applicationConfidence, industryReadiness]

  // Calculate weighted overall score
  const overallScore = Math.round(
    (conceptClarity.score * 0.25 + logicalConfidence.score * 0.25 + 
     applicationConfidence.score * 0.25 + industryReadiness.score * 0.25)
  )

  return {
    overall_score: overallScore,
    dimensions,
    behavior_summary: generateBehaviorSummary(features),
    recommendations: generateRecommendations(dimensions, features),
    confidence_trend: calculateTrend(features),
  }
}
