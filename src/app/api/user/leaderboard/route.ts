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

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get("quizId")
    const timeFilter = searchParams.get("timeFilter")
    const difficulty = searchParams.get("difficulty")

    // Build where clause
    let whereClause: any = {
      status: "SUBMITTED"
    }

    if (quizId && quizId !== "all") {
      whereClause.quizId = quizId
    }

    if (difficulty && difficulty !== "all") {
      whereClause.quiz = {
        difficulty: difficulty
      }
    }

    // Apply time filter
    if (timeFilter && timeFilter !== "all") {
      const now = new Date()
      let startDate = new Date()

      switch (timeFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
      }

      whereClause.submittedAt = {
        gte: startDate
      }
    }

    const attempts = await db.quizAttempt.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        quiz: {
          select: {
            title: true,
            difficulty: true
          }
        }
      },
      orderBy: [
        { score: "desc" },
        { timeTaken: "asc" },
        { submittedAt: "asc" }
      ],
      take: 100 // Limit to top 100
    })

    const leaderboard = attempts.map((attempt, index) => ({
      id: attempt.id,
      user: attempt.user,
      score: attempt.score || 0,
      totalPoints: attempt.totalPoints || 0,
      timeTaken: attempt.timeTaken || 0,
      submittedAt: attempt.submittedAt || attempt.createdAt,
      rank: index + 1,
      quizTitle: attempt.quiz.title,
      quizDifficulty: attempt.quiz.difficulty
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}