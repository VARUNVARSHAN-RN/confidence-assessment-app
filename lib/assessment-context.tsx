"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { BehavioralFeatures } from "./feature-extractor"

export interface Question {
  question_id: string
  question: string
  options: string[] // MCQ options (4 options for all question types)
  correct_answer: string
  topic: string
  difficulty: string
  segment: "MCQ" | "MCQ_REASONING" | "ASSERTION_REASON" // question format type
  reasoning_required: boolean // whether user must provide reasoning explanation
}

export interface QuestionResponse {
  question_id: string
  user_answer: string // selected option (A, B, C, or D)
  user_reasoning?: string // optional reasoning explanation (for MCQ_REASONING)
  is_correct: boolean
  total_time: number
  user_confidence: number
  topic: string
  behavioral_features?: BehavioralFeatures // extracted during/after answering
  revisions: number // track answer edits
}

interface AssessmentState {
  sessionId: string | null
  domain: string | null
  difficulty: "easy" | "moderate" | "hard" | null // difficulty level
  questions: Question[]
  responses: QuestionResponse[]
  currentQuestionIndex: number
  questionStartTime: number | null
  answerEditCount: number // track revisions for current answer
  isComplete: boolean
}

interface AssessmentContextType {
  state: AssessmentState
  initializeAssessment: (sessionId: string, domain: string, difficulty: string, questions: Question[]) => void
  startQuestion: (index: number) => void
  submitAnswer: (answer: string, confidence: number, features?: BehavioralFeatures) => void
  recordAnswerEdit: () => void // track answer revisions
  completeAssessment: () => void
  reset: () => void
  // Legacy compatibility
  sessionId: string | null
  setSessionId: (id: string) => void
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined)

const initialState: AssessmentState = {
  sessionId: null,
  domain: null,
  difficulty: null,
  questions: [],
  responses: [],
  currentQuestionIndex: 0,
  questionStartTime: null,
  answerEditCount: 0,
  isComplete: false,
}

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AssessmentState>(initialState)

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem("assessment_state")
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setState(parsed)
      } catch (error) {
        console.error("Failed to load assessment state:", error)
      }
    }
  }, [])

  // Save state to sessionStorage on changes
  useEffect(() => {
    if (state.sessionId) {
      sessionStorage.setItem("assessment_state", JSON.stringify(state))
    }
  }, [state])

  const initializeAssessment = (sessionId: string, domain: string, difficulty: string, questions: Question[]) => {
    setState({
      sessionId,
      domain,
      difficulty: difficulty as "easy" | "moderate" | "hard",
      questions,
      responses: [],
      currentQuestionIndex: 0,
      questionStartTime: null,
      answerEditCount: 0,
      isComplete: false,
    })
  }

  const startQuestion = (index: number) => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: index,
      questionStartTime: Date.now(),
      answerEditCount: 0, // reset edit count for new question
    }))
  }

  const recordAnswerEdit = () => {
    setState((prev) => ({
      ...prev,
      answerEditCount: prev.answerEditCount + 1,
    }))
  }

  const submitAnswer = (answer: string, confidence: number, features?: BehavioralFeatures) => {
    if (state.questionStartTime === null) return

    const currentQuestion = state.questions[state.currentQuestionIndex]
    const totalTime = Math.round((Date.now() - state.questionStartTime) / 1000)

    // Simple correctness check (can be enhanced with fuzzy matching)
    const isCorrect =
      answer.trim().toLowerCase() === currentQuestion.correct_answer.trim().toLowerCase()

    const response: QuestionResponse = {
      question_id: currentQuestion.question_id,
      user_answer: answer,
      is_correct: isCorrect,
      total_time: totalTime,
      user_confidence: confidence,
      topic: currentQuestion.topic,
      behavioral_features: features,
      revisions: state.answerEditCount,
    }

    setState((prev) => ({
      ...prev,
      responses: [...prev.responses, response],
      questionStartTime: null,
      answerEditCount: 0,
    }))
  }

  const completeAssessment = () => {
    setState((prev) => ({
      ...prev,
      isComplete: true,
    }))
  }

  const reset = () => {
    setState(initialState)
    sessionStorage.removeItem("assessment_state")
    sessionStorage.removeItem("assessment_domain")
  }

  // Legacy compatibility
  const setSessionId = (id: string) => {
    setState((prev) => ({ ...prev, sessionId: id }))
  }

  return (
    <AssessmentContext.Provider
      value={{
        state,
        initializeAssessment,
        startQuestion,
        submitAnswer,
        recordAnswerEdit,
        completeAssessment,
        reset,
        sessionId: state.sessionId,
        setSessionId,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider")
  }
  return context
}
