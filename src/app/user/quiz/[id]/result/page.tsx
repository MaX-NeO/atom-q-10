"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Trophy,
  ArrowLeft,
  Award
} from "lucide-react"
import { toast } from "sonner"
import { QuestionType, DifficultyLevel } from "@prisma/client"

interface QuizResult {
  id: string
  quiz: {
    title: string
    description?: string
    timeLimit?: number
  }
  score: number
  totalPoints: number
  timeTaken: number
  submittedAt: string
  answers: Array<{
    questionId: string
    userAnswer: string
    isCorrect: boolean
    pointsEarned: number
    question: {
      title: string
      content: string
      type: QuestionType
      correctAnswer: string
      explanation?: string
      difficulty: DifficultyLevel
      options?: string[]
    }
  }>
}

export default function QuizResultPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [quizId])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/user/quiz/${quizId}/result`)
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        toast.error("Failed to load quiz result")
        router.push("/user/quiz")
      }
    } catch (error) {
      toast.error("Failed to load quiz result")
      router.push("/user/quiz")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getScorePercentage = () => {
    if (!result) return 0
    return Math.round((result.score / result.totalPoints) * 100)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getCorrectAnswersCount = () => {
    if (!result) return 0
    return result.answers.filter(answer => answer.isCorrect).length
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading result...</div>
  }

  if (!result) {
    return <div className="flex items-center justify-center h-64">Result not found</div>
  }

  const scorePercentage = getScorePercentage()
  const correctAnswers = getCorrectAnswersCount()
  const totalQuestions = result.answers.length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/user/quiz")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
      </div>

      {/* Quiz Result Summary */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {scorePercentage >= 80 ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : scorePercentage >= 60 ? (
              <Award className="h-16 w-16 text-blue-500" />
            ) : (
              <Target className="h-16 w-16 text-gray-500" />
            )}
          </div>
          <CardTitle className="text-2xl">{result.quiz.title}</CardTitle>
          <CardDescription>Quiz completed on {new Date(result.submittedAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
              {result.score}/{result.totalPoints}
            </div>
            <div className="text-lg text-muted-foreground">
              {scorePercentage}% Score
            </div>
            <Progress value={scorePercentage} className="w-full max-w-md mx-auto" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Correct Answers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}/{totalQuestions}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Time Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(result.timeTaken)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Points Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {result.score}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>
            Review your answers and see the correct solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.answers.map((answer, index) => (
            <div key={answer.questionId} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Question {index + 1}</span>
                    <Badge variant={
                      answer.question.difficulty === DifficultyLevel.EASY ? "default" :
                      answer.question.difficulty === DifficultyLevel.MEDIUM ? "secondary" : "destructive"
                    }>
                      {answer.question.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {answer.pointsEarned}/{answer.pointsEarned + (answer.isCorrect ? 0 : 1)} points
                    </Badge>
                  </div>
                  <h3 className="font-medium">{answer.question.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {answer.question.content}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>

              <div className="grid gap-3 pl-4 border-l-2 border-gray-200">
                <div>
                  <span className="text-sm font-medium">Your Answer: </span>
                  <span className={`text-sm ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.userAnswer || "Not answered"}
                  </span>
                </div>

                {!answer.isCorrect && (
                  <div>
                    <span className="text-sm font-medium">Correct Answer: </span>
                    <span className="text-sm text-green-600">
                      {answer.question.correctAnswer}
                    </span>
                  </div>
                )}

                {answer.question.explanation && (
                  <div>
                    <span className="text-sm font-medium">Explanation: </span>
                    <span className="text-sm text-muted-foreground">
                      {answer.question.explanation}
                    </span>
                  </div>
                )}
              </div>

              {index < result.answers.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center">
        <Button onClick={() => router.push("/user/quiz")} size="lg">
          Take Another Quiz
        </Button>
      </div>
    </div>
  )
}