import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole, QuestionType, DifficultyLevel } from "@prisma/client"

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

    const questions = await db.quizQuestion.findMany({
      where: { quizId: id },
      include: {
        question: true
      },
      orderBy: {
        order: "asc"
      }
    })

    const formattedQuestions = questions.map(qq => ({
      id: qq.question.id,
      title: qq.question.title,
      content: qq.question.content,
      type: qq.question.type,
      options: qq.question.options,
      correctAnswer: qq.question.correctAnswer,
      explanation: qq.question.explanation,
      difficulty: qq.question.difficulty,
      isActive: qq.question.isActive,
      order: qq.order,
      points: qq.points,
    }))

    return NextResponse.json(formattedQuestions)
  } catch (error) {
    console.error("Error fetching quiz questions:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { db } from "@/lib/db"

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
    const body = await request.json()

    // Check if this is a request to create a new question or add existing ones
    if (body.title && body.content && body.type) {
      // This is a request to create a new question
      const {
        title,
        content,
        type,
        options,
        correctAnswer,
        explanation,
        difficulty,
        categoryId,
        points = 1.0
      } = body

      // Validate required fields
      if (!title || !content || !type || !options || !correctAnswer) {
        return NextResponse.json(
          { message: "Missing required fields" },
          { status: 400 }
        )
      }

      // Validate options based on question type
      let parsedOptions
      try {
        parsedOptions = Array.isArray(options) ? options : JSON.parse(options)
      } catch (error) {
        // If options is a string like "True|False", split it
        if (typeof options === 'string' && options.includes('|')) {
          parsedOptions = options.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0)
        } else {
          parsedOptions = Array.isArray(options) ? options : [options]
        }
      }

      if (type === QuestionType.MULTIPLE_CHOICE && parsedOptions.length < 2) {
        return NextResponse.json(
          { message: "Multiple choice questions must have at least 2 options" },
          { status: 400 }
        )
      }

      if (type === QuestionType.TRUE_FALSE) {
        // For True/False, ensure we have exactly 2 options or use default
        if (parsedOptions.length !== 2) {
          parsedOptions = ["True", "False"]
        }
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
          isActive: true
        }
      })

      // Add the question to the quiz
      const maxOrder = await db.quizQuestion.aggregate({
        where: { quizId: id },
        _max: { order: true }
      })

      const currentOrder = maxOrder._max.order || 0

      const quizQuestion = await db.quizQuestion.create({
        data: {
          quizId: id,
          questionId: question.id,
          order: currentOrder + 1,
          points
        }
      })

      return NextResponse.json({
        question,
        quizQuestion
      }, { status: 201 })
    } else if (body.questionIds) {
      // This is a request to add existing questions to the quiz
      const { questionIds } = body

      // Get current max order
      const maxOrder = await db.quizQuestion.aggregate({
        where: { quizId: id },
        _max: { order: true }
      })

      const currentOrder = maxOrder._max.order || 0

      // Create quiz questions
      const quizQuestions = await Promise.all(
        questionIds.map((questionId: string, index: number) =>
          db.quizQuestion.create({
            data: {
              quizId: id,
              questionId,
              order: currentOrder + index + 1,
              points: 1.0,
            }
          })
        )
      )

      return NextResponse.json(quizQuestions, { status: 201 })
    } else {
      return NextResponse.json(
        { message: "Invalid request format" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error processing quiz questions request:", error)
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

    const questions = await db.quizQuestion.findMany({
      where: { quizId: id },
      include: {
        question: {
          include: {
            category: true
          }
        }
      },
      orderBy: { order: "asc" }
    })

    const formattedQuestions = questions.map(qq => ({
      ...qq.question,
      order: qq.order,
      quizQuestionId: `${qq.quizId}-${qq.questionId}`
    }))

    return NextResponse.json(formattedQuestions)
  } catch (error) {
    console.error("Error fetching quiz questions:", error)
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
    const { questionIds } = await request.json()

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { message: "Question IDs array is required" },
        { status: 400 }
      )
    }

    // Get the current max order
    const maxOrderResult = await db.quizQuestion.aggregate({
      where: { quizId: id },
      _max: { order: true }
    })

    let nextOrder = (maxOrderResult._max.order || 0) + 1

    // Add questions to quiz
    const quizQuestions = questionIds.map(questionId => ({
      quizId: id,
      questionId,
      order: nextOrder++
    }))

    await db.quizQuestion.createMany({
      data: quizQuestions,
      skipDuplicates: true
    })

    return NextResponse.json({ 
      message: "Questions added successfully",
      count: questionIds.length 
    })
  } catch (error) {
    console.error("Error adding questions to quiz:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const questionId = searchParams.get("questionId")

    if (!questionId) {
      return NextResponse.json(
        { message: "Question ID is required" },
        { status: 400 }
      )
    }

    await db.quizQuestion.delete({
      where: {
        quizId_questionId: {
          quizId: id,
          questionId
        }
      }
    })

    return NextResponse.json({ message: "Question removed successfully" })
  } catch (error) {
    console.error("Error removing question from quiz:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
