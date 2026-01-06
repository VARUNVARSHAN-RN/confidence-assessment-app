"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Lightbulb, Target } from "lucide-react"
import ConfidenceTimeline from "@/components/confidence-timeline"
import TopicGrid from "@/components/topic-grid"

interface TopicRecord {
  topic: string
  subject: string
  lastConfidence: number
  trend: "up" | "stable" | "down"
  assessmentCount: number
  lastAssessedDate: string
}

export default function DashboardPage() {
  // Mock data (would come from Firestore in real system)
  const overallConfidenceScore = 71
  const totalAssessments = 8
  const topicsTracked = 4

  const recentTopics: TopicRecord[] = [
    {
      topic: "Object-Oriented Programming",
      subject: "Computer Science",
      lastConfidence: 72,
      trend: "up",
      assessmentCount: 3,
      lastAssessedDate: "2 days ago",
    },
    {
      topic: "Calculus I",
      subject: "Mathematics",
      lastConfidence: 65,
      trend: "stable",
      assessmentCount: 2,
      lastAssessedDate: "1 week ago",
    },
    {
      topic: "Genetics",
      subject: "Biology",
      lastConfidence: 58,
      trend: "down",
      assessmentCount: 1,
      lastAssessedDate: "3 weeks ago",
    },
    {
      topic: "Thermodynamics",
      subject: "Physics",
      lastConfidence: 82,
      trend: "up",
      assessmentCount: 4,
      lastAssessedDate: "5 days ago",
    },
  ]

  const timelineData = [
    { date: "Week 1", avgConfidence: 60 },
    { date: "Week 2", avgConfidence: 65 },
    { date: "Week 3", avgConfidence: 62 },
    { date: "Week 4", avgConfidence: 68 },
    { date: "Week 5", avgConfidence: 71 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Your Confidence Journey</h1>
              <p className="text-muted-foreground mt-2">Track your understanding across topics and over time</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/select">
                Start New Assessment <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Overall Confidence</h3>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{overallConfidenceScore}%</div>
            <p className="text-xs text-muted-foreground">Average across all assessed topics</p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Assessments</h3>
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{totalAssessments}</div>
            <p className="text-xs text-muted-foreground">Reflective assessments completed</p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Topics Tracked</h3>
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{topicsTracked}</div>
            <p className="text-xs text-muted-foreground">Unique subjects under assessment</p>
          </Card>
        </div>

        {/* Confidence Timeline */}
        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Confidence Over Time</h2>
          <ConfidenceTimeline data={timelineData} />
          <p className="text-sm text-muted-foreground pt-4 border-t border-border/40">
            This chart shows your average confidence across assessments week by week. Focus on the trend, not individual
            data points—gradual improvement is real progress.
          </p>
        </Card>

        {/* Recent Topics */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Your Topics</h2>
          <TopicGrid topics={recentTopics} />
        </div>

        {/* Reflection & Growth Section */}
        <Card className="p-8 bg-primary/5 border border-primary/20 space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Self-Reflection Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Look for Trends</h3>
              <p className="text-sm text-muted-foreground">
                Don't focus on individual scores. Notice if your confidence is growing over multiple assessments.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Revisit Weak Areas</h3>
              <p className="text-sm text-muted-foreground">
                Topics where confidence dipped are opportunities for deeper learning, not failures.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Celebrate Growth</h3>
              <p className="text-sm text-muted-foreground">
                Notice when confidence increases. That's evidence of real, lasting understanding.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
