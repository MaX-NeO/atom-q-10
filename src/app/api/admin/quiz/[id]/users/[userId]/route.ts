
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: quizId, userId } = await params

    // Check if enrollment exists
    const enrollment = await db.quizUser.findUnique({
      where: {
        quizId_userId: {
          quizId,
          userId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { message: "User is not enrolled in this quiz" },
        { status: 404 }
      )
    }

    // Delete quiz attempts first (due to foreign key constraints)
    await db.quizAttempt.deleteMany({
      where: {
        quizId,
        userId
      }
    })

    // Delete the enrollment
    await db.quizUser.delete({
      where: {
        quizId_userId: {
          quizId,
          userId
        }
      }
    })

    return NextResponse.json({
      message: "User unenrolled successfully"
    })
  } catch (error) {
    console.error("Error unenrolling user:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
