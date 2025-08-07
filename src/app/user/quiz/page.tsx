"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, FileText, Trophy, AlertCircle, Play, RotateCcw, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit: number | null
  difficulty: string
  maxAttempts: number | null
  startTime: string | null
  endTime: string | null
  questionCount: number
  attempts: number
  bestScore: number | null
  lastAttemptDate: string | null
  canAttempt: boolean
  attemptStatus: string
  hasInProgress: boolean
}

enum DifficultyLevel {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export default function UserQuizPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/")
      return
    }

    if (session?.user?.role !== "USER") {
      router.push("/admin")
      return
    }

    fetchQuizzes()
  }, [session, status, router])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/quiz", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch quizzes: ${response.status}`)
      }

      const data = await response.json()
      setQuizzes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      setError("Failed to load quizzes. Please try again.")
      toast.error("Failed to load quizzes")
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/user/quiz/${quizId}/start`, {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to start quiz")
      }

      toast.success("Quiz started successfully!")
      router.push(`/user/quiz/${quizId}/take?attempt=${data.attemptId}`)
    } catch (error: any) {
      console.error("Error starting quiz:", error)
      toast.error(error.message || "Failed to start quiz")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
      case "in_progress":
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><Play className="w-3 h-3 mr-1" />In Progress</Badge>
      case "expired":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>
      default:
        return <Badge variant="outline">Not Started</Badge>
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeLimit = (minutes: number | null) => {
    if (!minutes) return "No time limit"
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuizzes}
              className="ml-4"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Available Quizzes</h1>
          <p className="text-muted-foreground">
            Take quizzes assigned to you and test your knowledge
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="difficulty-filter" className="text-muted-foreground">Filter by Difficulty:</label>
          {/* Assuming Select and SelectItem components are available and imported */}
          {/* Replace with actual Select component if available */}
          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Difficulties</option>
            {Object.values(DifficultyLevel).map((level) => (
              <option key={level} value={level}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quizzes Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              There are no quizzes assigned to you at the moment. Check back later or contact your administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  {getStatusBadge(quiz.attemptStatus)}
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {quiz.questionCount} questions
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>

                {quiz.timeLimit && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTimeLimit(quiz.timeLimit)}
                  </div>
                )}

                {quiz.maxAttempts !== null && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attempts</span>
                      <span>{quiz.attempts}/{quiz.maxAttempts}</span>
                    </div>
                    <Progress
                      value={(quiz.attempts / quiz.maxAttempts) * 100}
                      className="h-2"
                    />
                  </div>
                )}

                {quiz.bestScore !== null && (
                  <div className="flex items-center text-sm">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    Best Score: {Math.round(quiz.bestScore)}%
                  </div>
                )}

                {quiz.startTime && new Date(quiz.startTime) > new Date() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Available from: {new Date(quiz.startTime).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                {quiz.endTime && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Deadline: {new Date(quiz.endTime).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleStartQuiz(quiz.id)}
                  disabled={!quiz.canAttempt}
                  className="w-full"
                  variant={quiz.hasInProgress ? "default" : "default"}
                >
                  {quiz.hasInProgress ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Continue Quiz
                    </>
                  ) : quiz.attemptStatus === "completed" ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Quiz
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}