"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Lightbulb, TrendingUp, AlertCircle } from "lucide-react"
import ConfidenceGauge from "@/components/confidence-gauge"
import TopicBreakdown from "@/components/topic-breakdown"

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const subject = searchParams.get("subject") || "Unknown"
  const topic = searchParams.get("topic") || "Unknown"

  // Mock confidence score and insights (would come from API in real system)
  const confidenceScore = 72
  const averageResponseTime = 45
  const consistencyScore = 78

  const insights = [
    {
      type: "strength",
      text: "You showed strong reasoning when explaining concepts. Your answers were thoughtful and detailed.",
    },
    {
      type: "clarity",
      text: "In some areas, your confidence fluctuated. This suggests you may benefit from deeper exploration of edge cases.",
    },
    {
      type: "growth",
      text: "Your consistency score is solid. Focus on the 'clarity zones' in the breakdown below to deepen understanding.",
    },
  ]

  const topicAreas = [
    { name: "Fundamentals", confidence: 85, status: "strong" },
    { name: "Application", confidence: 72, status: "moderate" },
    { name: "Advanced Concepts", confidence: 58, status: "needs-clarity" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground">{topic} Assessment</h1>
          <p className="text-muted-foreground mt-2">{subject}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Confidence Score Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Confidence Score</h2>
            <ConfidenceGauge score={confidenceScore} />
            <div className="space-y-3 pt-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Your confidence score reflects how well you understand the topic based on the consistency of your
                answers, the clarity of your explanations, and your response patterns.
              </p>
              <p className="text-sm font-medium text-foreground">
                This score is for your reflection only—it's a mirror of your understanding, not a judgment.
              </p>
            </div>
          </Card>

          {/* Key Metrics */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Response Time</p>
                  <p className="text-2xl font-bold text-foreground">{averageResponseTime}s</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">You took time to think through answers carefully.</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consistency Score</p>
                  <p className="text-2xl font-bold text-foreground">{consistencyScore}%</p>
                </div>
                <AlertCircle className="w-8 h-8 text-primary/40" />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Your answers were aligned with your confidence levels.
              </p>
            </Card>
          </div>
        </div>

        {/* Insights Section */}
        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" /> Insights & Reflections
          </h2>

          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border-l-4 ${
                  insight.type === "strength"
                    ? "border-l-green-500 bg-green-500/5"
                    : insight.type === "clarity"
                      ? "border-l-amber-500 bg-amber-500/5"
                      : "border-l-blue-500 bg-blue-500/5"
                }`}
              >
                <p className="text-foreground text-sm leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Topic Breakdown */}
        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Confidence by Topic Area</h2>
          <TopicBreakdown areas={topicAreas} />
          <p className="text-sm text-muted-foreground pt-4 border-t border-border/40">
            These breakdowns help you identify where to focus deeper learning. "Strong" areas show confident
            understanding. "Needs clarity" areas are opportunities for exploration.
          </p>
        </Card>

        {/* Next Steps */}
        <Card className="p-8 bg-primary/5 border border-primary/20 space-y-6">
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
