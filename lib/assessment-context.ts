import { create } from "zustand"

export interface AssessmentState {
  subject: string
  topic: string
  answers: Array<{
    questionId: string
    answer: string | number
    confidenceLevel: number
    timeSpent: number
  }>
  currentQuestionIndex: number
  setSubject: (subject: string) => void
  setTopic: (topic: string) => void
  addAnswer: (answer: any) => void
  setCurrentQuestion: (index: number) => void
  reset: () => void
}

// Simple state management for assessment flow
// In production, consider using Redux or Jotai for more complex state
export const useAssessmentStore = create<AssessmentState>((set) => ({
  subject: "",
  topic: "",
  answers: [],
  currentQuestionIndex: 0,
  setSubject: (subject) => set({ subject }),
  setTopic: (topic) => set({ topic }),
  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),
  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),
  reset: () => ({
    subject: "",
    topic: "",
    answers: [],
    currentQuestionIndex: 0,
  }),
}))
