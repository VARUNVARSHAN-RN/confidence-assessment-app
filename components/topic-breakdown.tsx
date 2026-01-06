"use client"

interface TopicArea {
  name: string
  confidence: number
  status: "strong" | "moderate" | "needs-clarity"
}

interface TopicBreakdownProps {
  areas: TopicArea[]
}

const getStatusColor = (status: string) => {
  if (status === "strong") return "bg-green-500"
  if (status === "moderate") return "bg-blue-500"
  return "bg-amber-500"
}

const getStatusLabel = (status: string) => {
  if (status === "strong") return "Strong"
  if (status === "moderate") return "Moderate"
  return "Needs Clarity"
}

export default function TopicBreakdown({ areas }: TopicBreakdownProps) {
  return (
    <div className="space-y-4">
      {areas.map((area, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{area.name}</span>
            <span className="text-sm font-semibold text-foreground">{area.confidence}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${getStatusColor(area.status)} transition-all duration-500`}
                style={{ width: `${area.confidence}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded">
              {getStatusLabel(area.status)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
