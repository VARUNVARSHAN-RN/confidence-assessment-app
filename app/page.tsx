"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lightbulb, TrendingUp, Target } from "lucide-react"

export default function LandingPage() {
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
            <Link href="/select" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Start Assessment
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/select">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-pretty">
            Measure Understanding, Not Marks
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Clarity helps you understand how well you truly grasp a topic. We focus on your confidence and reasoning,
            not test scores.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/select">
              Start Your Assessment <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-8 py-16 border-t border-b border-border/40">
          {/* Pillar 1: Non-Judgmental */}
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Thoughtful Assessment</h3>
            <p className="text-muted-foreground">
              No pressure, no judgment. Answer at your own pace and explain your thinking in your own words.
            </p>
          </div>

          {/* Pillar 2: Adaptive Learning */}
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Intelligent Adaptation</h3>
            <p className="text-muted-foreground">
              Questions adapt to your confidence. Difficulty evolves silently based on your understanding.
            </p>
          </div>

          {/* Pillar 3: Self-Reflection */}
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Self-Reflection Only</h3>
            <p className="text-muted-foreground">
              See your confidence trends over time. Compare only with yourself, improve at your own pace.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20 space-y-12">
          <h2 className="text-4xl font-bold text-foreground text-center">How It Works</h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-8 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0 text-lg">
                1
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">Choose Your Topic</h3>
                <p className="text-muted-foreground">
                  Select a subject and specific topic you want to assess. We'll start with thoughtful questions tailored
                  to that area.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-8 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0 text-lg">
                2
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">Answer & Explain</h3>
                <p className="text-muted-foreground">
                  Answer questions and explain your reasoning. Questions adapt based on how confident you seem. Multiple
                  choice, reasoning, or even code—whatever fits.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-8 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0 text-lg">
                3
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">Get Insights</h3>
                <p className="text-muted-foreground">
                  Receive honest feedback about your confidence level. See where you're strong and where you might need
                  clarity.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-8 items-start">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold flex-shrink-0 text-lg">
                4
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-2">Track Your Growth</h3>
                <p className="text-muted-foreground">
                  Review your confidence journey over time. Notice patterns, celebrate improvement, and identify areas
                  for deeper learning.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-12 text-center space-y-6 my-20">
          <h2 className="text-3xl font-bold text-foreground">Ready to Understand Yourself Better?</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start assessing your confidence in any topic. No marks, no pressure. Just clarity.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/select">
              Begin Assessment <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 Clarity. Helping learners understand themselves.</p>
        </div>
      </footer>
    </div>
  )
}
