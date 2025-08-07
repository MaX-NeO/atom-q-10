"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Eye,
  EyeOff,
  Minimize,
  Maximize,
  Timer,
  Brain,
  Zap,
  HelpCircle,
  CheckCircle
} from "lucide-react"
import { toasts } from "@/lib/toasts"
import { QuestionType } from "@prisma/client"

interface Question {
  id: string
  title: string
  content: string
  type: QuestionType
  options: string[]
  correctAnswer: string
  explanation: string
  points: number
}

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit: number
  showAnswers: boolean
  questions: Question[]
}

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attemptId, setAttemptId] = useState<string>("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAnswer, setShowAnswer] = useState<string | null>(null)
  const [canShowAnswers, setCanShowAnswers] = useState(false)

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/quiz/${params.id}/attempt`)
      if (response.ok) {
        const data = await response.json()
        
        // Validate the response data
        if (!data.quiz || !data.quiz.questions || data.quiz.questions.length === 0) {
          console.error("Invalid quiz data received:", {
            hasQuiz: !!data.quiz,
            hasQuestions: !!data.quiz?.questions,
            questionsLength: data.quiz?.questions?.length,
            fullData: data
          })
          toasts.error("Quiz data is incomplete or corrupted")
          router.push("/user/quiz")
          return
        }
        
        // Validate each question
        const invalidQuestions = data.quiz.questions.filter(q => !q.id || !q.content)
        if (invalidQuestions.length > 0) {
          console.error("Found invalid questions:", invalidQuestions)
          toasts.error("Some quiz questions are corrupted")
          router.push("/user/quiz")
          return
        }
        
        setQuiz(data.quiz)
        setAttemptId(data.attemptId)
        setTimeRemaining(data.timeRemaining || 0)
        setCanShowAnswers(data.quiz.showAnswers || false)
        
        // Set initial answers if any exist
        if (data.answers) {
          setAnswers(data.answers)
        }
      } else {
        const error = await response.json()
        console.error("Failed to fetch quiz:", error)
        toasts.error(error.message || "Failed to load quiz")
        router.push("/user/quiz")
      }
    } catch (error) {
      console.error("Error in fetchQuiz:", error)
      toasts.error("Failed to load quiz")
      router.push("/user/quiz")
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    if (session) {
      fetchQuiz()
    }
  }, [session, fetchQuiz])

  // Timer
  useEffect(() => {
    if (timeRemaining > 0 && !submitting) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, submitting])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleCheckAnswer = (questionId: string) => {
    setShowAnswer(prev => (prev === questionId ? null : questionId))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/user/quiz/${params.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toasts.success("Quiz submitted successfully!")
        router.push(`/user/quiz/${params.id}/result?attemptId=${attemptId}`)
      } else {
        const error = await response.json()
        toasts.error(error.message || "Failed to submit quiz")
      }
    } catch (error) {
      toasts.error("Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    const percentage = (timeRemaining / (quiz?.timeLimit * 60 || 1)) * 100
    if (percentage > 50) return "text-green-500"
    if (percentage > 20) return "text-yellow-500"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-medium">Loading quiz...</p>
        </motion.div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quiz not found</p>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const isAnswered = answers[currentQuestion.id]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold">{quiz.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Timer className={`h-5 w-5 ${getTimeColor()}`} />
              <span className={`text-lg font-mono font-bold ${getTimeColor()}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="mb-6"
        >
          <Progress value={progress} className="h-3 bg-gray-200 dark:bg-gray-700" />
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                    </Badge>
                  </div>
                  {quiz.checkAnswerEnabled && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckAnswer(currentQuestion.id)}
                        className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                      >
                        {showAnswer === currentQuestion.id ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Check Answer
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.content}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  {currentQuestion.options.map((option: string, index: number) => {
                    const isCorrect = showAnswer === currentQuestion.id && index.toString() === currentQuestion.correctAnswer
                    const isSelected = answers[currentQuestion.id] === option

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        } ${
                          isCorrect 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : ''
                        }`}
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="cursor-pointer flex-1 text-base"
                        >
                          {option}
                        </Label>
                        {isCorrect && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-green-500"
                          >
                            <Check className="h-5 w-5" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </RadioGroup>

                {showAnswer === currentQuestion.id && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                      <Zap className="h-4 w-4" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Check Answer Section */}
        {canShowAnswers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Need Help?</span>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCheckAnswer(currentQuestion.id)}
                className="flex items-center space-x-2"
              >
                {showAnswer === currentQuestion.id ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide Answer</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Show Answer</span>
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showAnswer === currentQuestion.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">
                          Correct Answer:
                        </p>
                        <p className="text-green-700 dark:text-green-300">
                          {currentQuestion.options[parseInt(currentQuestion.correctAnswer)]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentQuestion.explanation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Explanation:
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mt-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-white/80 dark:bg-gray-800/80"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          </motion.div>

          <div className="flex space-x-2">
            {quiz.questions.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white shadow-lg'
                    : answers[quiz.questions[index].id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {submitting ? "Submitting..." : "Finish Quiz"}
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                className="bg-white/80 dark:bg-gray-800/80"
                variant="outline"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}