
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        creator: true,
        quizQuestions: {
          include: {
            question: true
          }
        },
        quizUsers: {
          include: {
            user: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const {
      title,
      description,
      timeLimit,
      difficulty,
      status,
      negativeMarking,
      negativePoints,
      randomOrder,
      maxAttempts,
      showAnswers,
      startTime,
      endTime
    } = await request.json()

    const quiz = await db.quiz.update({
      where: { id },
      data: {
        title,
        description,
        timeLimit,
        difficulty,
        status,
        negativeMarking,
        negativePoints,
        randomOrder,
        maxAttempts,
        showAnswers,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null
      }
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("Error updating quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Delete in proper order to avoid constraint issues
    await db.quizAnswer.deleteMany({
      where: {
        attempt: {
          quizId: id
        }
      }
    })

    await db.quizAttempt.deleteMany({
      where: { quizId: id }
    })

    await db.quizUser.deleteMany({
      where: { quizId: id }
    })

    await db.quizQuestion.deleteMany({
      where: { quizId: id }
    })

    await db.quiz.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
