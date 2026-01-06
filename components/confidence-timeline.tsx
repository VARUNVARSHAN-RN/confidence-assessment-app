"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TimelineData {
  date: string
  avgConfidence: number
}

interface ConfidenceTimelineProps {
  data: TimelineData[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/40 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{payload[0].payload.date}</p>
        <p className="text-sm text-primary font-semibold">{payload[0].value}% confidence</p>
      </div>
    )
  }
  return null
}

export default function ConfidenceTimeline({ data }: ConfidenceTimelineProps) {
  return (
    <div className="w-full h-80 bg-muted/30 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" />
          <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground text-xs" />
          <YAxis stroke="currentColor" className="text-muted-foreground text-xs" domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="avgConfidence"
            stroke="currentColor"
            className="text-primary"
            strokeWidth={3}
            dot={{ fill: "currentColor", className: "text-primary", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
