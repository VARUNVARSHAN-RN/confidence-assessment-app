"use client"

import { AssessmentProvider } from "@/lib/assessment-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AssessmentProvider>{children}</AssessmentProvider>
}
