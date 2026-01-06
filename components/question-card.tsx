"use client"

import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface QuestionCardProps {
  question: {
    id: string
    type: "multiple-choice" | "assertion-reason" | "explain" | "coding"
    text: string
    options?: string[]
    difficulty: "moderate" | "medium" | "hard"
  }
  currentAnswer: string | number
  currentExplanation: string
  onAnswerChange: (value: string | number) => void
  onExplanationChange: (value: string) => void
}

const getDifficultyColor = (difficulty: string) => {
  if (difficulty === "moderate") return "text-blue-600"
  if (difficulty === "medium") return "text-amber-600"
  return "text-red-600"
}

const getDifficultyLabel = (difficulty: string) => {
  if (difficulty === "moderate") return "Foundational"
  if (difficulty === "medium") return "Intermediate"
  return "Advanced"
}

export default function QuestionCard({
  question,
  currentAnswer,
  currentExplanation,
  onAnswerChange,
  onExplanationChange,
}: QuestionCardProps) {
  return (
    <Card className="p-8 space-y-6">
      {/* Question Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-foreground leading-tight flex-1">{question.text}</h2>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full bg-muted whitespace-nowrap ${getDifficultyColor(question.difficulty)}`}
          >
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
      </div>

      {/* Question Type: Multiple Choice */}
      {question.type === "multiple-choice" && (
        <div className="space-y-4">
          <RadioGroup value={String(currentAnswer)} onValueChange={onAnswerChange}>
            {question.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg border border-border/40 hover:border-primary/40 cursor-pointer transition-colors"
              >
                <RadioGroupItem value={String(index)} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Question Type: Assertion-Reason */}
      {question.type === "assertion-reason" && (
        <div className="space-y-4">
          <RadioGroup value={String(currentAnswer)} onValueChange={onAnswerChange}>
            {question.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-lg border border-border/40 hover:border-primary/40 cursor-pointer transition-colors"
              >
                <RadioGroupItem value={String(index)} id={`ar-option-${index}`} />
                <Label htmlFor={`ar-option-${index}`} className="flex-1 cursor-pointer text-foreground">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Question Type: Explain */}
      {question.type === "explain" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">Your explanation:</label>
          <Textarea
            placeholder="Take your time and explain your thinking in your own words. There's no word limit."
            value={currentExplanation}
            onChange={(e) => onExplanationChange(e.target.value)}
            className="min-h-32 resize-none text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">{currentExplanation.length} characters</p>
        </div>
      )}

      {/* Question Type: Coding */}
      {question.type === "coding" && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">Your code:</label>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm border border-border/40">
            <textarea
              placeholder="Write your code here..."
              value={currentAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-40"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
