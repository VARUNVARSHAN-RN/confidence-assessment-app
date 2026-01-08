"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAssessment } from "@/lib/assessment-context"
import {
  computeOverallConfidence,
  generateBehavioralInsights,
  generateAdaptiveMessage,
  QuestionMetadata,
} from "@/lib/confidence-scorer"
import { generateConfidenceProfile, type MLConfidenceProfile } from "@/lib/ml-confidence-scorer"
import { extractFeatures, type BehavioralFeatures } from "@/lib/feature-extractor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { state, reset } = useAssessment()
  const [isLoading, setIsLoading] = useState(true)
  const [mlProfile, setMLProfile] = useState<MLConfidenceProfile | null>(null)

  useEffect(() => {
    // Verify we have results to show
    if (!state.sessionId || state.responses.length === 0) {
      // Try to load from storage
      const savedState = sessionStorage.getItem("assessment_state")
      if (!savedState) {
        router.push("/start")
        return
      }
    }
    
    // Generate ML profile from behavioral features
    if (state.responses.length > 0) {
      // Extract behavioral features from responses
      const features: BehavioralFeatures[] = state.responses.map((response, idx) => {
        // Create minimal feature extraction from available data
        const depthMap = { easy: "shallow", moderate: "medium", hard: "deep" }
        const difficulty = state.questions[idx]?.difficulty || "moderate"
        
        return {
          response_time: response.total_time,
          revisions: 0, // not tracked yet in current context
          explanation_length: response.user_answer?.length || 0,
          explanation_depth: (depthMap[difficulty as keyof typeof depthMap] || "medium") as any,
          concept_coverage: 50, // placeholder
          consistency_score: 50, // placeholder
          application_success: response.is_correct,
          time_to_first_word: response.total_time,
          answer_confidence_alignment: response.user_confidence - (response.is_correct ? 0 : -30),
        }
      })
      
      const correctnessRates = state.responses.map(r => r.is_correct ? 1 : 0)
      const profile = generateConfidenceProfile(features, correctnessRates)
      setMLProfile(profile)
    }
    
    setIsLoading(false)
  }, [state])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (state.responses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/start")}>Start New Assessment</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Convert responses to QuestionMetadata format
  const questionMetadata: QuestionMetadata[] = state.responses.map((r) => ({
    question_id: r.question_id,
    is_correct: r.is_correct,
    total_time: r.total_time,
    user_confidence: r.user_confidence,
    topic: r.topic,
  }))

  // Compute analytics
  const analytics = computeOverallConfidence(questionMetadata)
  const insights = generateBehavioralInsights(questionMetadata, analytics)
  const adaptiveMessage = generateAdaptiveMessage(analytics.overall_score)

  const overallPercentage = Math.round(analytics.overall_score * 100)

  // Category colors
  const getCategoryColor = (category: string) => {
    if (category === "Strong") return "bg-green-500"
    if (category === "Moderate") return "bg-blue-500"
    return "bg-orange-500"
  }

  const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "outline" => {
    if (category === "Strong") return "default"
    if (category === "Moderate") return "secondary"
    return "outline"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Assessment Results
          </h1>
          <p className="text-gray-600">
            {state.domain ? state.domain.replace(/-/g, " ").toUpperCase() : "Assessment"} •{" "}
            {state.responses.length} Questions Completed
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="shadow-xl border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Overall Confidence Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {overallPercentage}%
              </div>
              <Badge
                variant={
                  overallPercentage >= 85
                    ? "default"
                    : overallPercentage >= 65
                    ? "secondary"
                    : "outline"
                }
                className="mt-4 text-lg px-4 py-2"
              >
                {overallPercentage >= 85
                  ? "Strong Confidence"
                  : overallPercentage >= 65
                  ? "Moderate Confidence"
                  : "Needs Clarity"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {state.responses.filter((r) => r.is_correct).length}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {analytics.average_time}s
                </div>
                <div className="text-sm text-gray-600">Avg Time</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.consistency_score}%
                </div>
                <div className="text-sm text-gray-600">Consistency</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Dimensional Confidence Profile */}
        {mlProfile && (
          <Card className="shadow-lg border-l-4 border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Multi-Dimensional Confidence Profile</span>
                <div className="flex items-center gap-2">
                  {mlProfile.confidence_trend === "improving" && (
                    <span className="flex items-center gap-1 text-green-600">
                      <ArrowUp className="w-4 h-4" />
                      Improving
                    </span>
                  )}
                  {mlProfile.confidence_trend === "declining" && (
                    <span className="flex items-center gap-1 text-red-600">
                      <ArrowDown className="w-4 h-4" />
                      Declining
                    </span>
                  )}
                  {mlProfile.confidence_trend === "stable" && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Minus className="w-4 h-4" />
                      Stable
                    </span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall ML Score */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">ML-Based Overall Confidence</p>
                  <div className="text-5xl font-bold text-purple-600">
                    {mlProfile.overall_score}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Calculated from behavioral patterns and performance consistency
                  </p>
                </div>
              </div>

              {/* Dimension Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {mlProfile.dimensions.map((dimension) => {
                  const labelColor =
                    dimension.label === "Strong"
                      ? "text-green-600 bg-green-50"
                      : dimension.label === "Moderate"
                        ? "text-blue-600 bg-blue-50"
                        : "text-orange-600 bg-orange-50"

                  const barColor =
                    dimension.label === "Strong"
                      ? "bg-green-500"
                      : dimension.label === "Moderate"
                        ? "bg-blue-500"
                        : "bg-orange-500"

                  return (
                    <Card key={dimension.name} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">{dimension.name}</h3>
                          <Badge className={labelColor}>{dimension.label}</Badge>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {dimension.score}
                            </span>
                            <span className="text-xs text-gray-500">/ 100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-500`}
                              style={{ width: `${dimension.score}%` }}
                            ></div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {dimension.explanation}
                        </p>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Behavior Summary */}
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                <h3 className="font-semibold text-gray-800 mb-3">Behavioral Analysis</h3>
                <p className="text-gray-700 leading-relaxed">{mlProfile.behavior_summary}</p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">Recommendations for Growth</h3>
                <ul className="space-y-2">
                  {mlProfile.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-bold flex-shrink-0">{idx + 1}</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topic Breakdown */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Topic Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.topic_scores).map(([topic, data]) => {
              const percentage = Math.round(data.score * 100)
              return (
                <div key={topic} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700">{topic}</span>
                      <Badge variant={getCategoryBadgeVariant(data.category)}>
                        {data.category}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-gray-700">{percentage}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getCategoryColor(data.category)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.count} {data.count === 1 ? "question" : "questions"}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Behavioral Insights */}
        <Card className="shadow-lg border-l-4 border-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              Behavioral Insights & Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
              >
                <p className="text-gray-800 leading-relaxed">{insight}</p>
              </div>
            ))}

            {insights.length === 0 && (
              <p className="text-gray-600 italic">
                Complete more questions for detailed behavioral analysis.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Adaptive Message */}
        <Card className="shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="text-4xl">
                {overallPercentage >= 80 ? "🎉" : overallPercentage >= 60 ? "💪" : "🌱"}
              </div>
              <p className="text-xl font-semibold leading-relaxed">{adaptiveMessage}</p>
            </div>
          </CardContent>
        </Card>

        {/* Question Details (Optional Expandable) */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Question-by-Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.responses.map((response, idx) => {
              const question = state.questions.find((q) => q.question_id === response.question_id)
              return (
                <div
                  key={response.question_id}
                  className={`p-4 rounded-lg border-2 ${
                    response.is_correct
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-700">Q{idx + 1}</span>
                        <Badge variant={response.is_correct ? "default" : "outline"}>
                          {response.is_correct ? "✓ Correct" : "✗ Incorrect"}
                        </Badge>
                        <span className="text-xs text-gray-500">{response.topic}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {question?.question.slice(0, 100)}...
                      </p>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="text-gray-600">
                        Time: <span className="font-semibold">{response.total_time}s</span>
                      </div>
                      <div className="text-gray-600">
                        Confidence:{" "}
                        <span className="font-semibold">{response.user_confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              reset()
              router.push("/start")
            }}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Start New Assessment
          </Button>
        </div>
      </div>
    </div>
  )
}
