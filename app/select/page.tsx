"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronRight } from "lucide-react"

const SUBJECTS = {
  "Computer Science": [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Web Development (Frontend)",
    "Web Development (Backend)",
    "Machine Learning Basics",
    "Database Design",
    "Cloud Computing Fundamentals",
  ],
  Mathematics: [
    "Algebra",
    "Geometry",
    "Calculus I",
    "Calculus II",
    "Linear Algebra",
    "Probability & Statistics",
    "Discrete Mathematics",
  ],
  Physics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics", "Quantum Mechanics Basics"],
  Chemistry: [
    "General Chemistry",
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Biochemistry Basics",
  ],
  Biology: ["Cell Biology", "Genetics", "Molecular Biology", "Ecology", "Evolution"],
  Languages: ["English Writing", "Spanish Fundamentals", "French Conversation", "Grammar & Syntax"],
}

export default function SelectPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  const topicsForSubject = selectedSubject ? SUBJECTS[selectedSubject as keyof typeof SUBJECTS] : []

  const handleStartAssessment = () => {
    if (selectedSubject && selectedTopic) {
      // Next: navigate to assessment page and pass the selection
      window.location.href = `/assess?subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(selectedTopic)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-foreground hover:opacity-70 transition-opacity">
            ← Back to Home
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Select Your Topic</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">What would you like to assess?</h2>
          <p className="text-muted-foreground">
            Choose a subject and topic. We'll ask you questions tailored to that area.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Subject Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Step 1: Choose a Subject</h3>
            <div className="space-y-2">
              {Object.keys(SUBJECTS).map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject)
                    setSelectedTopic(null)
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedSubject === subject
                      ? "border-primary bg-primary/5"
                      : "border-border/40 bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{subject}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Topic Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Step 2: Choose a Topic</h3>
            {selectedSubject ? (
              <div className="space-y-2">
                {topicsForSubject.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedTopic === topic
                        ? "border-primary bg-primary/5"
                        : "border-border/40 bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="font-medium text-foreground">{topic}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-lg bg-muted/30 border border-border/40 text-center">
                <p className="text-muted-foreground">Select a subject first to see available topics</p>
              </div>
            )}
          </div>
        </div>

        {/* Selection Summary & CTA */}
        {selectedSubject && selectedTopic && (
          <div className="mt-12 p-8 rounded-xl bg-primary/5 border border-primary/20 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Start</h3>
              <p className="text-muted-foreground">
                You're about to assess your confidence in{" "}
                <span className="font-semibold text-foreground">{selectedTopic}</span> under{" "}
                <span className="font-semibold text-foreground">{selectedSubject}</span>.
              </p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You'll answer 5–8 questions at your own pace. There are no right or wrong answers—we're measuring your
                confidence, not your score. Take your time explaining your thinking.
              </p>
              <Button onClick={handleStartAssessment} size="lg" className="gap-2 w-full sm:w-auto">
                Start Assessment <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
