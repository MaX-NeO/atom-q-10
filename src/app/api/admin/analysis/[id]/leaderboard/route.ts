
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

    // Get quiz details
    const quiz = await db.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      )
    }

    // Get all submitted attempts for this quiz with user details
    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId: id,
        status: "SUBMITTED",
        score: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { score: "desc" },
        { submittedAt: "asc" }
      ]
    })

    // Group attempts by user and get best score
    const userBestScores = new Map()
    
    attempts.forEach(attempt => {
      const userId = attempt.user.id
      const existingBest = userBestScores.get(userId)
      
      if (!existingBest || (attempt.score && attempt.score > existingBest.score)) {
        userBestScores.set(userId, {
          userId: attempt.user.id,
          userName: attempt.user.name,
          userEmail: attempt.user.email,
          score: attempt.score,
          submittedAt: attempt.submittedAt,
          timeTaken: attempt.timeTaken
        })
      }
    })

    // Convert to array and sort by score
    const leaderboard = Array.from(userBestScores.values())
      .sort((a, b) => {
        if (b.score !== a.score) {
          return (b.score || 0) - (a.score || 0)
        }
        // If scores are equal, sort by submission time (earlier is better)
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }))

    return NextResponse.json({
      quiz,
      leaderboard,
      totalParticipants: leaderboard.length
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
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
import { UserRole, AttemptStatus } from "@prisma/client"

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

    // Get all completed attempts for this quiz
    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId: id,
        status: AttemptStatus.SUBMITTED
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { submittedAt: 'asc' }
      ]
    })

    // Format leaderboard data
    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      user: attempt.user,
      score: attempt.score || 0,
      timeTaken: attempt.timeTaken || 0,
      submittedAt: attempt.submittedAt?.toISOString()
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

    // Get quiz details
    const quiz = await db.quiz.findUnique({
      where: { id },
      select: { title: true }
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      )
    }

    // Get leaderboard data
    const leaderboard = await db.quizAttempt.findMany({
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
        }
      },
      orderBy: [
        { score: "desc" },
        { submittedAt: "asc" }
      ]
    })

    // Group by user and get best attempt
    const userBestAttempts = new Map()
    
    leaderboard.forEach(attempt => {
      const userId = attempt.userId
      if (!userBestAttempts.has(userId) || 
          attempt.score! > userBestAttempts.get(userId).score!) {
        userBestAttempts.set(userId, attempt)
      }
    })

    const formattedLeaderboard = Array.from(userBestAttempts.values())
      .map((attempt, index) => ({
        rank: index + 1,
        userId: attempt.user.id,
        userName: attempt.user.name,
        userEmail: attempt.user.email,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round((attempt.score! / attempt.totalQuestions!) * 100),
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt
      }))

    return NextResponse.json({
      quiz: quiz.title,
      leaderboard: formattedLeaderboard
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
