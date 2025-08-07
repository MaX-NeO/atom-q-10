import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const [totalUsers, totalQuizzes, totalQuestions, totalAttempts] = await Promise.all([
      db.user.count({
        where: { role: UserRole.USER }
      }),
      db.quiz.count(),
      db.question.count(),
      db.quizAttempt.count()
    ])

    return NextResponse.json({
      totalUsers,
      totalQuizzes,
      totalQuestions,
      totalAttempts
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}