import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, QuestionType, DifficultyLevel } from "@prisma/client"

export async function GET(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')

    const questions = await db.question.findMany({
      where: { 
        isActive: true,
        ...(quizId && {
          quizQuestions: {
            none: {
              quizId
            }
          }
        })
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      content,
      type,
      options,
      correctAnswer,
      explanation,
      difficulty,
      categoryId,
      isActive = true
    } = body

    // Validate required fields
    if (!title || !content || !type || !options || !correctAnswer) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate options based on question type
    const parsedOptions = Array.isArray(options) ? options : JSON.parse(options)
    
    if (type === QuestionType.MULTIPLE_CHOICE && parsedOptions.length < 2) {
      return NextResponse.json(
        { message: "Multiple choice questions must have at least 2 options" },
        { status: 400 }
      )
    }

    if (type === QuestionType.TRUE_FALSE && parsedOptions.length !== 2) {
      return NextResponse.json(
        { message: "True/False questions must have exactly 2 options" },
        { status: 400 }
      )
    }

    // Validate that correct answer is in options
    if (!parsedOptions.includes(correctAnswer)) {
      return NextResponse.json(
        { message: "Correct answer must be one of the options" },
        { status: 400 }
      )
    }

    // Create the question
    const question = await db.question.create({
      data: {
        title,
        content,
        type,
        options: JSON.stringify(parsedOptions),
        correctAnswer,
        explanation,
        difficulty: difficulty || DifficultyLevel.MEDIUM,
        categoryId,
        isActive
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}