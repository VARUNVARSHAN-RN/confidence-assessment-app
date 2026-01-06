// API client for communicating with backend endpoints
export const apiClient = {
  async generateQuestion(params: {
    subject: string
    topic: string
    difficulty: string
    previousAnswers: any[]
    userConfidence: number
  }) {
    const response = await fetch("/api/assessment/generate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    return response.json()
  },

  async evaluateAssessment(params: { answers: any[]; subject: string; topic: string }) {
    const response = await fetch("/api/assessment/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    return response.json()
  },

  async saveAssessment(params: { userId: string; subject: string; topic: string; answers: any[]; results: any }) {
    const response = await fetch("/api/assessment/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    return response.json()
  },

  async getAssessments(userId: string) {
    const response = await fetch(`/api/dashboard/get-assessments?userId=${userId}`)
    return response.json()
  },
}
