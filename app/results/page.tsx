"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lightbulb, TrendingUp, AlertCircle, Brain, Target, Sparkles, Loader2 } from "lucide-react"
import ConfidenceGauge from "@/components/confidence-gauge"
import TopicBreakdown from "@/components/topic-breakdown"
import { useAssessment } from "@/lib/assessment-context"

// Performance-aware insight generator
function generateInsights(accuracy: number, avgTime: number, confidenceConsistency: number, revisions: number) {
  const insights: { type: string; text: string; category: string }[] = []

  // 🔹 Thinking Style
  if (avgTime > 50 && accuracy >= 70) {
    insights.push({
      type: "thinking",
      category: "Thinking Style",
      text: "You took time to reason through answers carefully, indicating strong conceptual thinking.",
    })
  } else if (avgTime < 30 && accuracy >= 75) {
    insights.push({
      type: "thinking",
      category: "Thinking Style",
      text: "Your quick and accurate responses suggest high confidence and mastery.",
    })
  } else if (avgTime < 30 && accuracy < 60) {
    insights.push({
      type: "thinking",
      category: "Thinking Style",
      text: "You answered quickly but may benefit from deeper reflection on complex questions.",
    })
  } else {
    insights.push({
      type: "thinking",
      category: "Thinking Style",
      text: "Your pace shows balanced reasoning—you take time when needed.",
    })
  }

  // 🔹 Confidence Pattern
  if (confidenceConsistency >= 75) {
    insights.push({
      type: "confidence",
      category: "Confidence Pattern",
      text: "Your confidence remained consistent throughout, showing strong self-awareness.",
    })
  } else if (confidenceConsistency < 60 && accuracy >= 65) {
    insights.push({
      type: "confidence",
      category: "Confidence Pattern",
      text: "You performed better than you perceived, indicating underconfidence rather than lack of knowledge.",
    })
  } else if (confidenceConsistency < 60 && accuracy < 60) {
    insights.push({
      type: "confidence",
      category: "Confidence Pattern",
      text: "Your confidence fluctuated—reviewing foundational concepts may strengthen clarity.",
    })
  } else {
    insights.push({
      type: "confidence",
      category: "Confidence Pattern",
      text: "Your confidence was strong, though accuracy varied in some areas.",
    })
  }

  // 🔹 Learning Readiness
  if (accuracy >= 80 && avgTime < 40) {
    insights.push({
      type: "readiness",
      category: "Learning Readiness",
      text: "You demonstrate strong readiness for advanced topics and real-world application.",
    })
  } else if (accuracy >= 70 && accuracy < 80) {
    insights.push({
      type: "readiness",
      category: "Learning Readiness",
      text: "You're well-prepared for intermediate challenges with room to refine edge cases.",
    })
  } else if (accuracy >= 50 && accuracy < 70) {
    insights.push({
      type: "readiness",
      category: "Learning Readiness",
      text: "Your foundation is forming—targeted practice will elevate your confidence.",
    })
  } else {
    insights.push({
      type: "readiness",
      category: "Learning Readiness",
      text: "Focus on building core understanding before moving to advanced applications.",
    })
  }

  return insights
}

// Conditional recommendations generator
function generateRecommendations(accuracy: number, avgTime: number, confidenceConsistency: number, weakAreas: string[]) {
  const recommendations: string[] = []

  if (avgTime > 60 && accuracy >= 65) {
    recommendations.push("Improve speed via timed practice while maintaining accuracy.")
  }

  if (avgTime < 30 && accuracy < 65) {
    recommendations.push("Focus on careful reasoning—slow down to analyze complex scenarios.")
  }

  if (accuracy < 60) {
    recommendations.push("Practice case-based problems to strengthen application skills.")
  }

  if (Math.abs(confidenceConsistency - accuracy) > 20) {
    recommendations.push("Review foundational clarity to align confidence with performance.")
  }

  if (weakAreas.length > 0 && accuracy >= 70) {
    recommendations.push(`Deepen understanding in ${weakAreas[0]} through targeted exploration.`)
  }

  return recommendations.slice(0, 3) // Max 3 recommendations
}

// Final performance message generator
function generateFinalMessage(accuracy: number, confidenceScore: number) {
  if (accuracy >= 80 && confidenceScore >= 75) {
    return "You demonstrate strong conceptual clarity and confidence readiness."
  } else if (accuracy >= 65 && accuracy < 80) {
    return "You're progressing well—focused refinement will elevate your confidence."
  } else if (accuracy >= 50) {
    return "Your understanding is forming; consistent practice will strengthen clarity."
  } else {
    return "Build your foundation steadily—every step forward deepens your mastery."
  }
}

// Animated counter component
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <span>{count}</span>
}

// Loading screen component
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center space-y-6 px-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">{message}</h2>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { state } = useAssessment()
  const searchParams = useSearchParams()
  const subject = searchParams.get("subject") || state.domain || "Unknown"
  const topic = searchParams.get("topic") || state.domain || "Unknown"

  // Loading states
  const [loadingPhase, setLoadingPhase] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [animateScores, setAnimateScores] = useState(false)
  const [animateInsights, setAnimateInsights] = useState(false)
  const [animateRecommendations, setAnimateRecommendations] = useState(false)

  // Calculate metrics from actual responses
  const responses = state.responses
  const totalQuestions = responses.length || 10
  const correctAnswers = responses.filter((r) => r.is_correct).length
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
  const avgTime = responses.length > 0 
    ? Math.round(responses.reduce((sum, r) => sum + r.total_time, 0) / responses.length)
    : 45
  const totalRevisions = responses.reduce((sum, r) => sum + (r.revisions || 0), 0)
  
  // Calculate confidence consistency (how well confidence matches accuracy)
  const avgConfidence = responses.length > 0
    ? Math.round(responses.reduce((sum, r) => sum + r.user_confidence, 0) / responses.length)
    : 70
  const confidenceConsistency = Math.max(0, 100 - Math.abs(accuracy - avgConfidence))
  
  // Calculate overall confidence score (weighted combination)
  const confidenceScore = Math.round(
    accuracy * 0.5 + avgConfidence * 0.3 + confidenceConsistency * 0.2
  )

  // Group by topic for breakdown
  const topicGroups = responses.reduce((acc, r) => {
    if (!acc[r.topic]) acc[r.topic] = []
    acc[r.topic].push(r)
    return acc
  }, {} as Record<string, typeof responses>)

  const topicAreas = Object.entries(topicGroups).map(([name, resps]) => {
    const topicAccuracy = Math.round((resps.filter((r) => r.is_correct).length / resps.length) * 100)
    const status = topicAccuracy >= 75 ? "strong" : topicAccuracy >= 60 ? "moderate" : "needs-clarity"
    return { name, confidence: topicAccuracy, status }
  })

  const weakAreas = topicAreas.filter((a) => a.status === "needs-clarity").map((a) => a.name)

  // Generate dynamic content
  const insights = generateInsights(accuracy, avgTime, confidenceConsistency, totalRevisions)
  const recommendations = generateRecommendations(accuracy, avgTime, confidenceConsistency, weakAreas)
  const finalMessage = generateFinalMessage(accuracy, confidenceScore)

  // Loading sequence
  useEffect(() => {
    const messages = [
      "Analyzing your responses…",
      "Evaluating confidence patterns…",
      "Generating performance insights…",
    ]

    const sequence = [
      { delay: 0, action: () => setLoadingPhase(0) },
      { delay: 1000, action: () => setLoadingPhase(1) },
      { delay: 2000, action: () => setLoadingPhase(2) },
      { delay: 3200, action: () => setShowResults(true) },
      { delay: 3400, action: () => setAnimateScores(true) },
      { delay: 4200, action: () => setAnimateInsights(true) },
      { delay: 4800, action: () => setAnimateRecommendations(true) },
    ]

    const timers = sequence.map(({ delay, action }) => setTimeout(action, delay))
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!showResults) {
    const messages = [
      "Analyzing your responses…",
      "Evaluating confidence patterns…",
      "Generating performance insights…",
    ]
    return <LoadingScreen message={messages[loadingPhase]} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground animate-fade-in">{topic} Assessment</h1>
          <p className="text-muted-foreground mt-2 animate-fade-in">{subject}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Confidence Score Section */}
        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 ${animateScores ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Confidence Score</h2>
            <ConfidenceGauge score={confidenceScore} />
            <div className="space-y-3 pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Your confidence score reflects how well you understand the topic based on the consistency of your
                answers, the clarity of your explanations, and your response patterns.
              </p>
              <p className="text-sm font-medium text-foreground">
                Accuracy: <AnimatedCounter target={accuracy} />% | Avg Confidence: <AnimatedCounter target={avgConfidence} />%
              </p>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Response Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter target={avgTime} duration={1200} />s
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {avgTime > 50 ? "You took time to think through answers carefully." : "You answered with good pace and focus."}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consistency Score</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter target={confidenceConsistency} duration={1200} />%
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {confidenceConsistency >= 70 
                  ? "Your confidence aligned well with performance."
                  : "Your confidence and accuracy showed some variation."}
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Questions Answered</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCounter target={correctAnswers} duration={1000} /> / {totalQuestions}
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-xs text-primary/80 mt-3 font-medium">Correct answers</p>
            </Card>
          </div>
        </div>

        {/* Behavioral Insights Section */}
        <Card className={`p-8 space-y-6 transition-all duration-700 delay-200 ${animateInsights ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> Behavioral Analysis
          </h2>

          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="space-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {insight.category === "Thinking Style" && <Sparkles className="w-4 h-4 text-blue-500" />}
                  {insight.category === "Confidence Pattern" && <TrendingUp className="w-4 h-4 text-amber-500" />}
                  {insight.category === "Learning Readiness" && <Target className="w-4 h-4 text-green-500" />}
                  {insight.category}
                </h3>
                <p className="text-foreground/80 text-sm leading-relaxed pl-6">{insight.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <Card className={`p-8 space-y-6 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20 transition-all duration-700 delay-300 ${animateRecommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" /> Recommendations for Growth
            </h2>

            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-background/60 border border-primary/10 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <p className="text-foreground text-sm leading-relaxed flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">→</span>
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Topic Breakdown */}
        {topicAreas.length > 0 && (
          <Card className={`p-8 space-y-6 transition-all duration-700 delay-400 ${animateRecommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-semibold text-foreground">Performance by Topic Area</h2>
            <TopicBreakdown areas={topicAreas} />
            <p className="text-sm text-muted-foreground pt-4 border-t border-border/40">
              These breakdowns help you identify where to focus deeper learning. "Strong" areas show confident
              understanding. "Needs clarity" areas are opportunities for exploration.
            </p>
          </Card>
        )}

        {/* Final Performance Message */}
        <Card className={`p-8 bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 border border-primary/30 transition-all duration-700 delay-500 ${animateRecommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center space-y-4">
            <Sparkles className="w-10 h-10 text-primary mx-auto" />
            <p className="text-lg font-semibold text-foreground">{finalMessage}</p>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className={`p-8 bg-primary/5 border border-primary/20 space-y-6 transition-all duration-700 delay-600 ${animateRecommendations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-2xl font-semibold text-foreground">What's Next?</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Use these insights to guide your learning. Revisit areas where you need clarity, and build on your
              strengths.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="gap-2 bg-transparent">
                <Link href="/dashboard">
                  View Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 bg-transparent">
                <Link href="/select">
                  Try Another Topic <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
