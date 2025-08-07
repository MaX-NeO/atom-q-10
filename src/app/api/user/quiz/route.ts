
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, QuizStatus, AttemptStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.USER) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all quizzes assigned to this user or open quizzes
    const assignedQuizzes = await db.quizUser.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            _count: {
              select: {
                quizQuestions: true
              }
            }
          }
        }
      }
    })

    // Get all open quizzes (not specifically assigned)
    const openQuizzes = await db.quiz.findMany({
      where: {
        status: QuizStatus.ACTIVE,
        NOT: {
          quizUsers: {
            some: {}
          }
        }
      },
      include: {
        _count: {
          select: {
            quizQuestions: true
          }
        }
      }
    })

    // Combine assigned and open quizzes
    const allQuizzes = [
      ...assignedQuizzes.map(aq => aq.quiz),
      ...openQuizzes
    ]

    // Get user's attempts for these quizzes
    const userAttempts = await db.quizAttempt.findMany({
      where: {
        userId,
        quizId: {
          in: allQuizzes.map(q => q.id)
        }
      },
      select: {
        quizId: true,
        status: true,
        score: true,
        submittedAt: true,
        startedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create a map of attempts by quiz ID
    const attemptsByQuiz = new Map()
    userAttempts.forEach(attempt => {
      if (!attemptsByQuiz.has(attempt.quizId)) {
        attemptsByQuiz.set(attempt.quizId, [])
      }
      attemptsByQuiz.get(attempt.quizId).push(attempt)
    })

    // Format response
    const formattedQuizzes = allQuizzes.map(quiz => {
      const attempts = attemptsByQuiz.get(quiz.id) || []
      const completedAttempts = attempts.filter(a => a.status === AttemptStatus.SUBMITTED)
      const inProgressAttempt = attempts.find(a => a.status === AttemptStatus.IN_PROGRESS)
      
      let canAttempt = true
      let attemptStatus = 'not_started'
      
      if (inProgressAttempt) {
        attemptStatus = 'in_progress'
      } else if (completedAttempts.length > 0) {
        attemptStatus = 'completed'
        
        // Check if user can attempt again based on maxAttempts
        if (quiz.maxAttempts !== null && completedAttempts.length >= quiz.maxAttempts) {
          canAttempt = false
        }
      }

      // Check time constraints
      const now = new Date()
      if (quiz.startTime && new Date(quiz.startTime) > now) {
        canAttempt = false
        attemptStatus = 'not_started'
      }
      
      if (quiz.endTime && new Date(quiz.endTime) < now) {
        canAttempt = false
        attemptStatus = 'expired'
      }

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        difficulty: quiz.difficulty,
        maxAttempts: quiz.maxAttempts,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        questionCount: quiz._count.quizQuestions,
        attempts: completedAttempts.length,
        bestScore: completedAttempts.length > 0 
          ? Math.max(...completedAttempts.map(a => a.score || 0))
          : null,
        lastAttemptDate: completedAttempts.length > 0 
          ? completedAttempts[0].submittedAt 
          : null,
        canAttempt,
        attemptStatus,
        hasInProgress: !!inProgressAttempt
      }
    })

    return NextResponse.json(formattedQuizzes)
  } catch (error) {
    console.error("Error fetching user quizzes:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
