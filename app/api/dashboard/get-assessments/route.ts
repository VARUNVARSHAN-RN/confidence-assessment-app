import { type NextRequest, NextResponse } from "next/server"

// Fetches user's assessment history
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    // In production, fetch from Firestore:
    // const assessments = await db
    //   .collection('users')
    //   .doc(userId)
    //   .collection('assessments')
    //   .orderBy('timestamp', 'desc')
    //   .get()

    // Mock data for now
    const assessments = [
      {
        id: "a1",
        subject: "Computer Science",
        topic: "Object-Oriented Programming",
        confidenceScore: 72,
        date: "2025-01-04",
        trend: "up",
      },
      {
        id: "a2",
        subject: "Mathematics",
        topic: "Calculus I",
        confidenceScore: 65,
        date: "2024-12-28",
        trend: "stable",
      },
    ]

    return NextResponse.json({ success: true, assessments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assessments", details: (error as any).message }, { status: 500 })
  }
}
