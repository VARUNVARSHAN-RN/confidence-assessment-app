"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, TrendingUp, Target } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const handleStartAssessment = () => {
    router.push("/start")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Clarity</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/start"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Assessment
            </Link>
            <Button variant="default" size="sm" onClick={handleStartAssessment}>
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Measure Understanding, Not Marks
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Clarity helps you understand how well you truly grasp a topic.
            We focus on your confidence and reasoning, not test scores.
          </p>
          <Button size="lg" className="gap-2" onClick={handleStartAssessment}>
            Start Your Assessment <ArrowRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-8 py-16 border-t border-b border-border/40">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Thoughtful Assessment</h3>
            <p className="text-muted-foreground">
              No pressure, no judgment. Answer at your own pace.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Intelligent Adaptation</h3>
            <p className="text-muted-foreground">
              Questions adapt silently to your confidence level.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Self-Reflection Only</h3>
            <p className="text-muted-foreground">
              Track your confidence growth over time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2025 Clarity. Helping learners understand themselves.
        </div>
      </footer>
    </div>
  )
}
