import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, studentId } = await params

    // Remove student from quiz
    await db.quizUser.delete({
      where: {
        quizId_userId: {
          quizId: id,
          userId: studentId
        }
      }
    })

    return NextResponse.json({ message: "Student removed successfully" })
  } catch (error) {
    console.error("Error removing student:", error)
    return NextResponse.json(
      { error: "Failed to remove student" },
      { status: 500 }
    )
  }
}