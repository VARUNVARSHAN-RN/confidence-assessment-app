"use client"

import { useEffect, useState } from "react"
import { useAssessment } from "@/lib/assessment-context"

type Question = {
  question_id: string
  question: string
  difficulty: string
  options: { key: string; text: string }[]
}

export default function SelectPage() {
  const { sessionId } = useAssessment()

  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedOption, setSelectedOption] = useState<string>("")
  const [explanation, setExplanation] = useState("")
  const [confidence, setConfidence] = useState(50)

  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Fetch question
  useEffect(() => {
    if (!sessionId) return

    const fetchQuestion = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/assessment/question/${sessionId}`
        )
        const data = await res.json()
        setQuestion(data)
      } catch (err) {
        setError("Failed to load question")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [sessionId])

  // Submit answer
  const submitAnswer = async () => {
    if (!question || !sessionId) return

    const payload = {
      session_id: sessionId,
      question_id: question.question_id,
      selected_option: selectedOption,
      explanation,
      self_confidence: confidence,
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/assessment/answer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      setResult(data)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen p-10 space-y-6">
      <h1 className="text-2xl font-bold">Select Your Topic</h1>

      <div className="p-4 bg-green-100 border border-green-300 rounded">
        <p className="font-semibold">Session Connected</p>
        <p className="text-sm break-all">{sessionId}</p>
      </div>

      {loading && <p>Loading question…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {question && !submitted && (
        <div className="p-6 border rounded space-y-4 bg-white">
          <p className="text-sm text-muted-foreground">
            Difficulty: {question.difficulty}
          </p>

          <h2 className="text-lg font-semibold">{question.question}</h2>

          {/* Multiple Choice */}
          <div className="space-y-2">
            {question.options.map((opt) => (
              <label key={opt.key} className="block">
                <input
                  type="radio"
                  name="option"
                  value={opt.key}
                  checked={selectedOption === opt.key}
                  onChange={() => setSelectedOption(opt.key)}
                  className="mr-2"
                />
                {opt.text}
              </label>
            ))}
          </div>

          {/* Explanation */}
          <textarea
            className="w-full border rounded p-2"
            placeholder="Explain your reasoning..."
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />

          {/* Confidence Slider */}
          <div>
            <label className="block font-medium">
              How confident are you? ({confidence}%)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={submitAnswer}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Submit Answer
          </button>
        </div>
      )}

      {submitted && result && (
        <div className="p-6 bg-gray-100 border rounded space-y-2">
          <h3 className="font-bold text-lg">Confidence Analysis</h3>
          <p>Confidence Score: {result.confidence_score}%</p>
          <p>Reasoning Quality: {result.reasoning_quality}</p>
          <p>{result.feedback}</p>
        </div>
      )}
    </div>
  )
}
