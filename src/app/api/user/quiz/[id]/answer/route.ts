import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.USER) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { id } = await params
    const { questionId, answer } = await request.json()

    // Find the active attempt
    const attempt = await db.quizAttempt.findFirst({
      where: {
        quizId: id,
        userId,
        status: "IN_PROGRESS"
      }
    })

    if (!attempt) {
      return NextResponse.json(
        { message: "No active quiz attempt found" },
        { status: 404 }
      )
    }

    // Get the question to check the correct answer
    const question = await db.question.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      )
    }

    // Check if the answer is correct
    const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()

    // Save or update the answer
    await db.quizAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId
        }
      },
      update: {
        answer,
        isCorrect
      },
      create: {
        attemptId: attempt.id,
        questionId,
        answer,
        isCorrect
      }
    })

    return NextResponse.json({ 
      message: "Answer saved successfully",
      isCorrect 
    })
  } catch (error) {
    console.error("Error saving answer:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}