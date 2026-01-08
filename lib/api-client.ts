const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export async function startAssessment(subject: string, topic: string) {
  if (!BACKEND_URL) {
    throw new Error("Backend URL is not defined")
  }

  const response = await fetch(
    `${BACKEND_URL}/api/assessment/start`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subject, topic }),
    }
  )

  if (!response.ok) {
    throw new Error("Failed to start assessment")
  }

  return response.json()
}
