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
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { questionOrders } = await request.json()

    // Update all question orders
    await Promise.all(
      questionOrders.map(({ questionId, order }: { questionId: string; order: number }) =>
        db.quizQuestion.update({
          where: {
            quizId_questionId: {
              quizId: id,
              questionId
            }
          },
          data: { order }
        })
      )
    )

    return NextResponse.json({ message: "Questions reordered successfully" })
  } catch (error) {
    console.error("Error reordering questions:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}