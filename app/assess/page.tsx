"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, Clock } from "lucide-react"
import QuestionCard from "@/components/question-card"
import { useSearchParams } from "next/navigation"

interface Question {
  id: string
  type: "multiple-choice" | "assertion-reason" | "explain" | "coding"
  text: string
  options?: string[]
  difficulty: "moderate" | "medium" | "hard"
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "multiple-choice",
    text: "What is the primary goal of object-oriented programming?",
    options: [
      "To make code faster",
      "To organize code into reusable objects with properties and methods",
      "To eliminate the need for variables",
      "To replace all loops with recursion",
    ],
    difficulty: "moderate",
  },
  {
    id: "q2",
    type: "explain",
    text: "Explain what inheritance means in the context of OOP.",
    difficulty: "medium",
  },
  {
    id: "q3",
    type: "assertion-reason",
    text: "Assertion: Polymorphism allows objects to take multiple forms. Reason: Different classes can implement the same interface.",
    options: [
      "Both true and related",
      "Both true but unrelated",
      "Assertion true, reason false",
      "Assertion false, reason true",
    ],
    difficulty: "medium",
  },
  {
    id: "q4",
    type: "explain",
    text: "Describe how you would use encapsulation to protect sensitive data in a banking application.",
    difficulty: "hard",
  },
  {
    id: "q5",
    type: "multiple-choice",
    text: "Which principle emphasizes writing code that is easy to understand and maintain?",
    options: ["DRY (Don't Repeat Yourself)", "SOLID principles", "Both A and B", "Neither"],
    difficulty: "moderate",
  },
]

interface Answer {
  questionId: string
  answer: string | number
  confidenceLevel: number
  timeSpent: number
}

export default function AssessmentPage() {
  const searchParams = useSearchParams()
  const subject = searchParams.get("subject") || "Unknown"
  const topic = searchParams.get("topic") || "Unknown"

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState<string | number>("")
  const [currentExplanation, setCurrentExplanation] = useState("")
  const [confidenceLevel, setConfidenceLevel] = useState(50)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isAnswering, setIsAnswering] = useState(true)

  // Timer for current question
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [questionStartTime])

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === SAMPLE_QUESTIONS.length - 1

  const handleAnswer = useCallback(() => {
    if (!currentAnswer && currentQuestion.type !== "explain") {
      return
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        answer: currentAnswer || currentExplanation,
        confidenceLevel,
        timeSpent,
      },
    ])

    if (isLastQuestion) {
      // Navigate to results page
      window.location.href = `/results?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer("")
      setCurrentExplanation("")
      setConfidenceLevel(50)
      setQuestionStartTime(Date.now())
      setElapsedTime(0)
    }
  }, [
    currentAnswer,
    currentExplanation,
    currentQuestion,
    confidenceLevel,
    questionStartTime,
    answers,
    isLastQuestion,
    subject,
    topic,
  ])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{topic}</h1>
              <p className="text-sm text-muted-foreground">{subject}</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Question {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length}
              </span>
              <span>{Math.round(((currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Question Card */}
          <QuestionCard
            question={currentQuestion}
            currentAnswer={currentAnswer}
            currentExplanation={currentExplanation}
            onAnswerChange={(value: string | number) => setCurrentAnswer(value)}
            onExplanationChange={setCurrentExplanation}
          />

          {/* Confidence Slider */}
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How confident are you in your answer?</h3>
              <p className="text-sm text-muted-foreground">
                Be honest. This helps us understand your true understanding.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Not confident</span>
                <span className="text-2xl font-bold text-primary">{confidenceLevel}%</span>
                <span className="text-sm text-muted-foreground">Very confident</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-foreground">
                {confidenceLevel < 33
                  ? "You seem uncertain—that's okay. We'll adapt to this."
                  : confidenceLevel < 67
                    ? "You're moderately confident. Good foundation."
                    : "You seem confident. We might increase difficulty next."}
              </p>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {currentQuestionIndex > 0 ? (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestionIndex(currentQuestionIndex - 1)
                  setCurrentAnswer("")
                  setCurrentExplanation("")
                  setConfidenceLevel(50)
                  setQuestionStartTime(Date.now())
                  setElapsedTime(0)
                }}
              >
                ← Previous
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={handleAnswer}
              disabled={!currentAnswer && currentQuestion.type !== "explain"}
              className="gap-2"
            >
              {isLastQuestion ? "Finish Assessment" : "Next Question"} <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
