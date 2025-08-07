import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

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

    // Get user's quiz attempts
    const attempts = await db.quizAttempt.findMany({
      where: {
        userId,
        status: "SUBMITTED"
      },
      include: {
        quiz: {
          select: {
            title: true,
            _count: {
              select: {
                quizQuestions: true
              }
            }
          }
        }
      }
    })

    const totalQuizzesTaken = attempts.length
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + (attempt.timeTaken || 0), 0)
    const quizzesCompleted = attempts.filter(attempt => attempt.status === "SUBMITTED").length

    // Calculate average score
    let totalScore = 0
    let totalPossible = 0
    let bestScore = 0

    attempts.forEach(attempt => {
      const score = attempt.score || 0
      const totalPoints = attempt.totalPoints || 0

      totalScore += score
      totalPossible += totalPoints

      const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0
      if (percentage > bestScore) {
        bestScore = percentage
      }
    })

    const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0

    return NextResponse.json({
      totalQuizzesTaken,
      averageScore,
      totalTimeSpent,
      quizzesCompleted,
      bestScore: Math.round(bestScore)
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}