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

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get("quizId")

    if (!quizId) {
      // Return all students if no specific quiz is specified
      const students = await db.user.findMany({
        where: {
          role: UserRole.USER,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })

      return NextResponse.json(students)
    }

    // Get students who are NOT enrolled in this quiz
    const enrolledStudentIds = await db.quizUser.findMany({
      where: { quizId },
      select: { userId: true }
    })

    const enrolledIds = enrolledStudentIds.map(enrollment => enrollment.userId)

    // Build the where clause dynamically
    const whereClause: any = {
      role: UserRole.USER,
      isActive: true
    }

    // Only add notIn filter if there are enrolled students
    if (enrolledIds.length > 0) {
      whereClause.id = {
        notIn: enrolledIds
      }
    }

    const availableStudents = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: { name: "asc" }
    })

    const formattedStudents = availableStudents.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      enrolled: false
    }))

    return NextResponse.json(formattedStudents)
  } catch (error) {
    console.error("Error fetching available students:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}