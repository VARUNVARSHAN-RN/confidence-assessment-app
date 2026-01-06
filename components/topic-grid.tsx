"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TopicRecord {
  topic: string
  subject: string
  lastConfidence: number
  trend: "up" | "stable" | "down"
  assessmentCount: number
  lastAssessedDate: string
}

interface TopicGridProps {
  topics: TopicRecord[]
}

const getTrendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="w-5 h-5 text-green-500" />
  if (trend === "down") return <TrendingDown className="w-5 h-5 text-amber-500" />
  return <Minus className="w-5 h-5 text-blue-500" />
}

const getTrendLabel = (trend: string) => {
  if (trend === "up") return "Improving"
  if (trend === "down") return "Declining"
  return "Stable"
}

export default function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {topics.map((topic, index) => (
        <Card key={index} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">{topic.topic}</h3>
              <p className="text-sm text-muted-foreground">{topic.subject}</p>
            </div>
            {getTrendIcon(topic.trend)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Confidence</p>
              <p className="text-2xl font-bold text-foreground">{topic.lastConfidence}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assessments</p>
              <p className="text-2xl font-bold text-foreground">{topic.assessmentCount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{getTrendLabel(topic.trend)}</span>
              <span>Last: {topic.lastAssessedDate}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${topic.lastConfidence}%` }} />
            </div>
          </div>

          <Button asChild variant="outline" className="w-full gap-2 bg-transparent" size="sm">
            <Link href={`/select?topic=${encodeURIComponent(topic.topic)}`}>
              Reassess <TrendingUp className="w-4 h-4" />
            </Link>
          </Button>
        </Card>
      ))}
    </div>
  )
}
