"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, Settings, Eye, Edit2, Trash2, Copy } from "lucide-react"
import QuestionCard from "@/components/question-card"

const SUBJECTS = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Languages"]

const QUESTION_TYPES = [
  {
    id: "multiple-choice",
    name: "Multiple Choice",
    icon: "◎",
    description: "Select one correct answer from options",
  },
  {
    id: "assertion-reason",
    name: "Assertion-Reason",
    icon: "⇄",
    description: "Evaluate relationship between two statements",
  },
  {
    id: "explain",
    name: "Open-Ended",
    icon: "✎",
    description: "Write explanation in your own words",
  },
  {
    id: "coding",
    name: "Coding Problem",
    icon: "</> ",
    description: "Write code to solve a problem",
  },
]

const SAMPLE_QUESTIONS = {
  "Computer Science": [
    {
      id: "cs-1",
      type: "multiple-choice",
      subject: "Computer Science",
      topic: "Object-Oriented Programming",
      text: "What is the primary goal of encapsulation in OOP?",
      options: [
        "To make code faster",
        "To bundle data and methods together while hiding internal details",
        "To eliminate the need for inheritance",
        "To replace all loops with recursion",
      ],
      difficulty: "moderate",
      confidence: 78,
      attempts: 12,
    },
    {
      id: "cs-2",
      type: "assertion-reason",
      subject: "Computer Science",
      topic: "Data Structures",
      text: "Assertion: Hash tables provide O(1) average lookup time. Reason: They use a hash function to map keys directly to indices.",
      options: [
        "Both true and related",
        "Both true but unrelated",
        "Assertion true, reason false",
        "Assertion false, reason true",
      ],
      difficulty: "medium",
      confidence: 65,
      attempts: 8,
    },
    {
      id: "cs-3",
      type: "coding",
      subject: "Computer Science",
      topic: "Algorithms",
      text: "Write a function that reverses a string without using built-in reverse methods.",
      difficulty: "medium",
      confidence: 72,
      attempts: 5,
    },
  ],
  Mathematics: [
    {
      id: "math-1",
      type: "multiple-choice",
      subject: "Mathematics",
      topic: "Calculus I",
      text: "What is the derivative of f(x) = x³ + 2x²?",
      options: ["3x² + 4x", "3x² + 4", "x² + 2x", "3x + 4"],
      difficulty: "moderate",
      confidence: 82,
      attempts: 6,
    },
    {
      id: "math-2",
      type: "explain",
      subject: "Mathematics",
      topic: "Linear Algebra",
      text: "Explain why the determinant of a matrix is zero when two rows are identical.",
      difficulty: "hard",
      confidence: 58,
      attempts: 3,
    },
  ],
  Physics: [
    {
      id: "phys-1",
      type: "assertion-reason",
      subject: "Physics",
      topic: "Mechanics",
      text: "Assertion: An object moving in a circle at constant speed has zero acceleration. Reason: Acceleration is the rate of change of velocity.",
      options: [
        "Both true and related",
        "Both true but unrelated",
        "Assertion true, reason false",
        "Assertion false, reason true",
      ],
      difficulty: "hard",
      confidence: 61,
      attempts: 4,
    },
  ],
  Chemistry: [
    {
      id: "chem-1",
      type: "multiple-choice",
      subject: "Chemistry",
      topic: "Organic Chemistry",
      text: "Which compound is a primary alcohol?",
      options: ["(CH₃)₂CHOH", "CH₃CH₂OH", "(CH₃)₃COH", "C₆H₅OH"],
      difficulty: "medium",
      confidence: 71,
      attempts: 7,
    },
  ],
  Biology: [
    {
      id: "bio-1",
      type: "explain",
      subject: "Biology",
      topic: "Genetics",
      text: "Describe the process of mitosis and explain why it's essential for organism growth.",
      difficulty: "hard",
      confidence: 68,
      attempts: 2,
    },
  ],
  Languages: [
    {
      id: "lang-1",
      type: "multiple-choice",
      subject: "Languages",
      topic: "Spanish Fundamentals",
      text: "Which verb form is correct: 'Yo _____ muy cansado'?",
      options: ["soy", "estoy", "tengo", "voy"],
      difficulty: "moderate",
      confidence: 75,
      attempts: 9,
    },
  ],
}

export default function QuestionsPage() {
  const [selectedSubject, setSelectedSubject] = useState("Computer Science")
  const [selectedType, setSelectedType] = useState("multiple-choice")
  const [activeTab, setActiveTab] = useState("showcase")
  const [previewMode, setPreviewMode] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState(SAMPLE_QUESTIONS["Computer Science"][0])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [currentExplanation, setCurrentExplanation] = useState("")
  const [confidenceLevel, setConfidenceLevel] = useState(50)

  const questionsForSubject = SAMPLE_QUESTIONS[selectedSubject as keyof typeof SAMPLE_QUESTIONS] || []
  const questionsForType = questionsForSubject.filter((q) => q.type === selectedType)

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "moderate") return "bg-blue-100 text-blue-800"
    if (difficulty === "medium") return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
  }

  const getDifficultyLabel = (difficulty: string) => {
    if (difficulty === "moderate") return "Foundational"
    if (difficulty === "medium") return "Intermediate"
    return "Advanced"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Question Library</h1>
              <p className="text-muted-foreground mt-1">Explore and build assessment questions</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/select" className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Back to Assessment
                </Link>
              </Button>
            </div>
          </div>

          {/* Subject & Type Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Question Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
            <TabsTrigger value="showcase" className="gap-2">
              <Eye className="w-4 h-4" />
              Showcase
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <Settings className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Builder
            </TabsTrigger>
          </TabsList>

          {/* SHOWCASE TAB - Interactive Preview */}
          <TabsContent value="showcase" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Question List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-semibold text-foreground text-lg">
                  {selectedType === "multiple-choice"
                    ? "Multiple Choice Questions"
                    : selectedType === "assertion-reason"
                      ? "Assertion-Reason Questions"
                      : selectedType === "explain"
                        ? "Open-Ended Questions"
                        : "Coding Questions"}
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {questionsForType.length === 0 ? (
                    <Card className="p-4 text-center text-muted-foreground">No {selectedType} questions yet</Card>
                  ) : (
                    questionsForType.map((question) => (
                      <Card
                        key={question.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedQuestion.id === question.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setSelectedQuestion(question)
                          setCurrentAnswer("")
                          setCurrentExplanation("")
                          setConfidenceLevel(50)
                        }}
                      >
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{question.text}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {getDifficultyLabel(question.difficulty)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {question.attempts} attempts
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                <Button className="w-full gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  Add New Question
                </Button>
              </div>

              {/* Right: Live Preview */}
              <div className="lg:col-span-2 space-y-6">
                {selectedQuestion && (
                  <>
                    {/* Question Preview */}
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-4">Live Preview</h3>
                      <QuestionCard
                        question={{
                          id: selectedQuestion.id,
                          type: selectedQuestion.type as "multiple-choice" | "assertion-reason" | "explain" | "coding",
                          text: selectedQuestion.text,
                          options: selectedQuestion.options,
                          difficulty: selectedQuestion.difficulty as "moderate" | "medium" | "hard",
                        }}
                        currentAnswer={currentAnswer}
                        currentExplanation={currentExplanation}
                        onAnswerChange={(value) => setCurrentAnswer(String(value))}
                        onExplanationChange={setCurrentExplanation}
                      />
                    </div>

                    {/* Confidence Slider */}
                    <Card className="p-6 space-y-4">
                      <h4 className="font-semibold text-foreground">Test Confidence Slider</h4>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={confidenceLevel}
                          onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Not confident</span>
                          <span className="text-2xl font-bold text-primary">{confidenceLevel}%</span>
                          <span className="text-sm text-muted-foreground">Very confident</span>
                        </div>
                      </div>
                    </Card>

                    {/* Question Stats */}
                    <Card className="p-6 space-y-4">
                      <h4 className="font-semibold text-foreground">Question Metrics</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Avg Confidence</p>
                          <p className="text-2xl font-bold text-foreground">{selectedQuestion.confidence}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Attempts</p>
                          <p className="text-2xl font-bold text-foreground">{selectedQuestion.attempts}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Difficulty</p>
                          <p className="text-lg font-semibold text-foreground">
                            {getDifficultyLabel(selectedQuestion.difficulty)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* LIBRARY TAB - Question Types Overview */}
          <TabsContent value="library" className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-4">Question Types Reference</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {QUESTION_TYPES.map((type) => (
                  <Card key={type.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl font-bold text-primary opacity-50">{type.icon}</div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-foreground text-lg">{type.name}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>

                    {/* Example for each type */}
                    <div className="pt-4 border-t border-border/40 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Example</p>
                      {type.id === "multiple-choice" && (
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-2">What does OOP stand for?</p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>• Object-Oriented Programming</p>
                            <p>• Object-Orderly Process</p>
                            <p>• Operating Output Parameters</p>
                          </div>
                        </div>
                      )}
                      {type.id === "assertion-reason" && (
                        <div className="text-sm space-y-2">
                          <p className="font-medium text-foreground">
                            A: Arrays allow O(1) random access. R: They store elements contiguously.
                          </p>
                          <p className="text-muted-foreground">Evaluate if both are true and related</p>
                        </div>
                      )}
                      {type.id === "explain" && (
                        <div className="text-sm space-y-2">
                          <p className="font-medium text-foreground">
                            Why is version control important in software development?
                          </p>
                          <p className="text-muted-foreground">
                            Students write detailed explanation in their own words
                          </p>
                        </div>
                      )}
                      {type.id === "coding" && (
                        <div className="text-sm space-y-2">
                          <p className="font-medium text-foreground">
                            Write a function to find the largest number in an array
                          </p>
                          <p className="text-muted-foreground">Students write functioning code to solve the problem</p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2 bg-transparent"
                      onClick={() => {
                        setSelectedType(type.id)
                        setActiveTab("showcase")
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View Examples
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <Card className="p-8 bg-primary/5 border border-primary/20 space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Question Design Best Practices</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Multiple Choice</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>4-5 plausible options</li>
                    <li>Single best answer</li>
                    <li>Test conceptual understanding</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Open-Ended</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>No wrong answer format</li>
                    <li>Encourages reasoning</li>
                    <li>Measures confidence in depth</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Assertion-Reason</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Tests causal relationships</li>
                    <li>Evaluates depth of knowledge</li>
                    <li>More complex than multiple choice</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Coding</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Tests practical application</li>
                    <li>Verifiable correctness</li>
                    <li>Best for technical subjects</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* BUILDER TAB - Create New Questions */}
          <TabsContent value="builder" className="space-y-6">
            <Card className="p-8 space-y-6">
              <h3 className="font-semibold text-foreground text-lg">Create New Question</h3>

              <div className="space-y-6">
                {/* Subject Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                  <Select defaultValue="Computer Science">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Topic Input */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g., Binary Search Trees, Photosynthesis, etc."
                    className="w-full px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Question Type Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Question Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {QUESTION_TYPES.map((type) => (
                      <Button
                        key={type.id}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2 text-xs text-center bg-transparent"
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="font-medium">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Question Text</label>
                  <textarea
                    placeholder="Write your question here. Be clear and specific."
                    className="w-full px-4 py-3 rounded-lg border border-border/40 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-24"
                  />
                </div>

                {/* Options (for multiple choice/assertion-reason) */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Options</label>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${i}`}
                          className="flex-1 px-4 py-2 rounded-lg border border-border/40 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input type="radio" name="correct-answer" className="w-5 h-5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Difficulty Level</label>
                  <div className="flex gap-2">
                    {["Foundational", "Intermediate", "Advanced"].map((level) => (
                      <Button key={level} variant="outline" size="sm">
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Question
                  </Button>
                  <Button variant="outline">Preview</Button>
                </div>
              </div>
            </Card>

            {/* Recent Questions Created */}
            <Card className="p-8 space-y-4">
              <h3 className="font-semibold text-foreground text-lg">Recently Created</h3>
              <div className="space-y-3">
                {questionsForSubject.slice(0, 3).map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-4 border border-border/40 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{question.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">{question.topic}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
