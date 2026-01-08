"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAssessment } from "@/lib/assessment-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000"

export default function AssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, initializeAssessment, startQuestion, submitAnswer, completeAssessment } =
    useAssessment()

  const [isLoading, setIsLoading] = useState(true)
  const [selectedOption, setSelectedOption] = useState("") // MCQ option (A, B, C, D)
  const [reasoning, setReasoning] = useState("") // Reasoning explanation for MCQ_REASONING
  const [confidence, setConfidence] = useState(50)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [editCount, setEditCount] = useState(0) // track answer edits/revisions

  // Timer effect
  useEffect(() => {
    if (state.questionStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - state.questionStartTime!) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [state.questionStartTime])

  // Initialize assessment on first load
  useEffect(() => {
    const domain = searchParams.get("domain") || sessionStorage.getItem("assessment_domain")
    const difficulty = searchParams.get("difficulty") || sessionStorage.getItem("assessment_difficulty") || "moderate"

    if (!domain) {
      router.push("/start")
      return
    }

    if (state.questions.length === 0 && !state.isComplete) {
      // Generate questions with difficulty parameter
      fetch(`${BACKEND_URL}/api/assessment/generate-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, count: 10, difficulty }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.questions) {
            initializeAssessment(data.session_id, domain, difficulty, data.questions)
            startQuestion(0)
          } else {
            throw new Error("Failed to generate questions")
          }
        })
        .catch((error) => {
          console.error("Question generation failed:", error)
          alert("Failed to generate questions. Please try again.")
          router.push("/start")
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
      if (state.questionStartTime === null && state.currentQuestionIndex < state.questions.length) {
        startQuestion(state.currentQuestionIndex)
      }
    }
  }, [])

  const handleSubmit = () => {
    const currentQuestion = state.questions[state.currentQuestionIndex]
    
    // Validation based on question type
    if (!selectedOption) {
      alert("Please select an option before submitting.")
      return
    }
    
    if (currentQuestion?.reasoning_required && !reasoning.trim()) {
      alert("Please provide your reasoning explanation.")
      return
    }

    submitAnswer(selectedOption, confidence)
    
    // Reset for next question
    setSelectedOption("")
    setReasoning("")
    setConfidence(50)
    setElapsedTime(0)
    setEditCount(0)

    // Move to next question or complete
    if (state.currentQuestionIndex + 1 < state.questions.length) {
      const nextIndex = state.currentQuestionIndex + 1
      startQuestion(nextIndex)
    } else {
      completeAssessment()
      router.push(`/results/${state.sessionId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Generating questions using AI...</p>
        </div>
      </div>
    )
  }

  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/start")}>Return to Start</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = state.questions[state.currentQuestionIndex]
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Progress Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span className="font-semibold">
              Question {state.currentQuestionIndex + 1} of {state.questions.length}
            </span>
            <span className="font-mono">
              Time: {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1 flex-1">
                <div className="text-sm text-gray-500">
                  Topic: <span className="font-semibold text-gray-700">{currentQuestion.topic}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Difficulty: {currentQuestion.difficulty}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">
                {currentQuestion.question}
              </p>
            </div>

            {/* MCQ Options */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700">
                  Select your answer:
                </Label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => {
                    const optionLetter = option.charAt(0) // Extract A, B, C, or D
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedOption(optionLetter)
                          if (editCount > 0 || selectedOption) setEditCount(editCount + 1)
                        }}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedOption === optionLetter
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-gray-800">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reasoning Input (for MCQ_REASONING) */}
            {currentQuestion.reasoning_required && (
              <div className="space-y-2">
                <Label htmlFor="reasoning" className="text-base font-semibold text-gray-700">
                  Explain your reasoning: <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reasoning"
                  value={reasoning}
                  onChange={(e) => {
                    setReasoning(e.target.value)
                    if (editCount > 0 || reasoning) setEditCount(editCount + 1)
                  }}
                  placeholder="Explain why you selected this option and why the others are incorrect..."
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Provide a clear explanation of your logical reasoning.
                </p>
              </div>
            )}

            {/* Confidence Slider */}
            <div className="space-y-3">
              <Label htmlFor="confidence" className="text-base font-semibold">
                Self-Confidence Level: {confidence}%
              </Label>
              <div className="space-y-2">
                <input
                  id="confidence"
                  type="range"
                  min="0"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Not Confident</span>
                  <span>Somewhat Confident</span>
                  <span>Very Confident</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {state.currentQuestionIndex + 1 < state.questions.length
                ? "Submit & Next Question"
                : "Submit & View Results"}
            </Button>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="bg-white rounded-lg shadow-sm p-4 text-sm text-gray-600">
          <p>
            💡 <strong>Tip:</strong> This assessment evaluates not just correctness, but also your
            reasoning depth, time management, and self-awareness. Take your time to think through
            each answer.
          </p>
        </div>
      </div>
    </div>
  )
}
