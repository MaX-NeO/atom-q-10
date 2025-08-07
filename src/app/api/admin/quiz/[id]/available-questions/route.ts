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

    // Get questions that are NOT already added to this quiz
    const availableQuestions = await db.question.findMany({
      where: {
        isActive: true,
        quizQuestions: {
          none: {
            quizId: id
          }
        }
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(availableQuestions)
  } catch (error) {
    console.error("Error fetching available questions:", error)
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
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const difficulty = searchParams.get("difficulty")
    const search = searchParams.get("search")

    // Get questions not already in this quiz
    const existingQuestionIds = await db.quizQuestion.findMany({
      where: { quizId: id },
      select: { questionId: true }
    })

    const excludeIds = existingQuestionIds.map(q => q.questionId)

    const whereClause: any = {
      isActive: true
    }

    // Exclude questions already in quiz
    if (excludeIds.length > 0) {
      whereClause.id = {
        notIn: excludeIds
      }
    }

    // Add filters
    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    if (difficulty) {
      whereClause.difficulty = difficulty
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const questions = await db.question.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching available questions:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
