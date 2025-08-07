import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        quizQuestions: {
          include: {
            question: true
          },
          orderBy: {
            order: "asc"
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      )
    }

    // Get all submitted attempts with answers
    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId: id,
        status: "SUBMITTED"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        answers: true
      },
      orderBy: {
        submittedAt: "asc"
      }
    })

    // Create result matrix
    const questions = quiz.quizQuestions.map(qq => qq.question)

    const resultMatrix = attempts.map(attempt => {
      const userAnswers = new Map(
        attempt.answers.map(answer => [answer.questionId, answer])
      )

      const questionResults = questions.map(question => {
        const answer = userAnswers.get(question.id)
        return {
          questionId: question.id,
          questionTitle: question.title,
          correctAnswer: question.correctAnswer,
          userAnswer: answer?.userAnswer || null,
          isCorrect: answer?.isCorrect || false,
          points: answer?.points || 0
        }
      })

      return {
        attemptId: attempt.id,
        user: attempt.user,
        totalScore: attempt.score,
        submittedAt: attempt.submittedAt,
        timeTaken: attempt.timeTaken,
        questionResults
      }
    })

    // Calculate question-wise statistics
    const questionStats = questions.map(question => {
      const totalAnswers = attempts.length
      const correctAnswers = attempts.filter(attempt => 
        attempt.answers.some(answer => 
          answer.questionId === question.id && answer.isCorrect
        )
      ).length

      return {
        questionId: question.id,
        questionTitle: question.title,
        totalAnswers,
        correctAnswers,
        incorrectAnswers: totalAnswers - correctAnswers,
        correctPercentage: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0
      }
    })

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title
      },
      questions,
      resultMatrix,
      questionStats,
      summary: {
        totalAttempts: attempts.length,
        totalQuestions: questions.length,
        averageScore: attempts.length > 0 
          ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length 
          : 0
      }
    })
  } catch (error) {
    console.error("Error fetching result matrix:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get all attempts for this quiz with user details
    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId: id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                correctAnswer: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // Format result matrix data
    const resultMatrix = attempts.map(attempt => {
      const totalQuestions = attempt.answers.length
      const correctAnswers = attempt.answers.filter(answer => 
        answer.isCorrect === true
      ).length
      const errors = totalQuestions - correctAnswers

      return {
        id: attempt.id,
        user: attempt.user,
        status: attempt.status,
        score: attempt.score || 0,
        timeTaken: attempt.timeTaken || 0,
        errors,
        submittedAt: attempt.submittedAt?.toISOString()
      }
    })

    return NextResponse.json(resultMatrix)
  } catch (error) {
    console.error("Error fetching result matrix:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        quizQuestions: {
          include: {
            question: true
          },
          orderBy: { order: "asc" }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      )
    }

    // Get all attempts with answers
    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId: id,
        status: "SUBMITTED"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { submittedAt: "desc" }
    })

    // Build result matrix
    const questions = quiz.quizQuestions.map(qq => qq.question)
    const resultMatrix = attempts.map(attempt => {
      const answerMap = new Map(
        attempt.answers.map(answer => [answer.questionId, answer])
      )

      return {
        attemptId: attempt.id,
        userId: attempt.user.id,
        userName: attempt.user.name,
        userEmail: attempt.user.email,
        totalScore: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score! / attempt.totalQuestions!) * 100),
        submittedAt: attempt.submittedAt,
        answers: questions.map(question => {
          const answer = answerMap.get(question.id)
          return {
            questionId: question.id,
            questionTitle: question.title,
            questionType: question.type,
            correctAnswer: question.correctAnswer,
            userAnswer: answer?.answer || null,
            isCorrect: answer?.isCorrect || false,
            answered: !!answer
          }
        })
      }
    })

    // Calculate question statistics
    const questionStats = questions.map(question => {
      const totalAnswers = attempts.length
      const correctAnswers = attempts.filter(attempt => {
        const answer = attempt.answers.find(a => a.questionId === question.id)
        return answer?.isCorrect || false
      }).length

      return {
        questionId: question.id,
        questionTitle: question.title,
        totalAttempts: totalAnswers,
        correctAnswers,
        incorrectAnswers: totalAnswers - correctAnswers,
        successRate: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
      }
    })

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        totalQuestions: questions.length
      },
      questions,
      resultMatrix,
      questionStats
    })
  } catch (error) {
    console.error("Error fetching result matrix:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
