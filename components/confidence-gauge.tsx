"use client"

import { useEffect, useState } from "react"

interface ConfidenceGaugeProps {
  score: number
}

export default function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      if (current < score) {
        current += 2
        setDisplayScore(Math.min(current, score))
      } else {
        clearInterval(interval)
      }
    }, 20)
    return () => clearInterval(interval)
  }, [score])

  const getScoreLabel = (s: number) => {
    if (s < 30) return "Building Foundation"
    if (s < 50) return "Developing Understanding"
    if (s < 70) return "Solid Understanding"
    if (s < 85) return "Strong Confidence"
    return "Excellent Mastery"
  }

  const getScoreColor = (s: number) => {
    if (s < 30) return "from-red-500 to-red-600"
    if (s < 50) return "from-amber-500 to-amber-600"
    if (s < 70) return "from-blue-500 to-blue-600"
    if (s < 85) return "from-emerald-500 to-emerald-600"
    return "from-violet-500 to-violet-600"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      {/* Circular Gauge */}
      <div className="relative w-48 h-48">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Background arc */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />

          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(displayScore / 100) * 565.48} 565.48`}
            strokeLinecap="round"
            className={`text-primary transition-all duration-500`}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />

          {/* Center text */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-5xl font-bold fill-foreground"
            style={{ fontSize: "56px" }}
          >
            {displayScore}
          </text>
          <text
            x="100"
            y="135"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm fill-muted-foreground"
            style={{ fontSize: "14px" }}
          >
            %
          </text>
        </svg>
      </div>

      {/* Label */}
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">{getScoreLabel(displayScore)}</p>
        <p className="text-sm text-muted-foreground">Based on your responses and reasoning patterns</p>
      </div>
    </div>
  )
}
