
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

    // Get enrolled users for this quiz
    const enrolledUsers = await db.user.findMany({
      where: {
        quizUsers: {
          some: {
            quizId: id
          }
        },
        role: UserRole.USER
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    return NextResponse.json(enrolledUsers)
  } catch (error) {
    console.error("Error fetching enrolled users:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

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
    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: "User IDs are required" },
        { status: 400 }
      )
    }

    // Check if quiz exists
    const quiz = await db.quiz.findUnique({
      where: { id }
    })

    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" },
        { status: 404 }
      )
    }

    // Check for existing enrollments to avoid duplicates
    const existingEnrollments = await db.quizUser.findMany({
      where: {
        quizId: id,
        userId: { in: userIds }
      }
    })

    const enrolledUserIds = existingEnrollments.map(enrollment => enrollment.userId)
    const newUserIds = userIds.filter(id => !enrolledUserIds.includes(id))

    if (newUserIds.length === 0) {
      return NextResponse.json(
        { message: "All selected users are already enrolled" },
        { status: 400 }
      )
    }

    // Create quiz enrollments only for new users
    const quizEnrollments = await Promise.all(
      newUserIds.map(userId =>
        db.quizUser.create({
          data: {
            userId: userId,
            quizId: id
          }
        })
      )
    )

    // Create initial quiz attempts for enrolled users
    const quizAttempts = await Promise.all(
      newUserIds.map(userId =>
        db.quizAttempt.create({
          data: {
            userId: userId,
            quizId: id,
            status: AttemptStatus.NOT_STARTED,
          }
        })
      )
    )

    return NextResponse.json({
      message: `${newUserIds.length} users enrolled successfully`,
      enrolledCount: newUserIds.length
    })
  } catch (error) {
    console.error("Error enrolling users:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
