
'use server'

import { db } from '@/lib/db'
import { createQuizSchema, updateQuizSchema, quizEnrollmentSchema } from '@/schema/quiz'
import { revalidatePath } from 'next/cache'

export async function createQuizAction(creatorId: string, formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    timeLimit: formData.get('timeLimit') as string,
    difficulty: formData.get('difficulty') as string,
    negativeMarking: formData.get('negativeMarking') === 'true',
    negativePoints: formData.get('negativePoints') as string,
    randomOrder: formData.get('randomOrder') === 'true',
    maxAttempts: formData.get('maxAttempts') as string,
    showAnswers: formData.get('showAnswers') === 'true',
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    checkAnswerEnabled: formData.get('checkAnswerEnabled') === 'true',
  }

  const validatedFields = createQuizSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    const quiz = await db.quiz.create({
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description || null,
        timeLimit: validatedFields.data.timeLimit,
        difficulty: validatedFields.data.difficulty,
        negativeMarking: validatedFields.data.negativeMarking,
        negativePoints: validatedFields.data.negativePoints,
        randomOrder: validatedFields.data.randomOrder,
        maxAttempts: validatedFields.data.maxAttempts,
        showAnswers: validatedFields.data.showAnswers,
        startTime: validatedFields.data.startTime ? new Date(validatedFields.data.startTime) : null,
        endTime: validatedFields.data.endTime ? new Date(validatedFields.data.endTime) : null,
        checkAnswerEnabled: validatedFields.data.checkAnswerEnabled,
        creatorId,
      }
    })

    revalidatePath('/admin/quiz')
    return {
      success: true,
      message: 'Quiz created successfully',
      quizId: quiz.id,
    }
  } catch (error) {
    return {
      message: 'Failed to create quiz',
    }
  }
}

export async function updateQuizAction(quizId: string, formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    timeLimit: formData.get('timeLimit') as string,
    difficulty: formData.get('difficulty') as string,
    status: formData.get('status') as string,
    negativeMarking: formData.get('negativeMarking') === 'true',
    negativePoints: formData.get('negativePoints') as string,
    randomOrder: formData.get('randomOrder') === 'true',
    maxAttempts: formData.get('maxAttempts') as string,
    showAnswers: formData.get('showAnswers') === 'true',
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    checkAnswerEnabled: formData.get('checkAnswerEnabled') === 'true',
  }

  const validatedFields = updateQuizSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    await db.quiz.update({
      where: { id: quizId },
      data: {
        title: validatedFields.data.title,
        description: validatedFields.data.description || null,
        timeLimit: validatedFields.data.timeLimit,
        difficulty: validatedFields.data.difficulty,
        status: validatedFields.data.status,
        negativeMarking: validatedFields.data.negativeMarking,
        negativePoints: validatedFields.data.negativePoints,
        randomOrder: validatedFields.data.randomOrder,
        maxAttempts: validatedFields.data.maxAttempts,
        showAnswers: validatedFields.data.showAnswers,
        startTime: validatedFields.data.startTime ? new Date(validatedFields.data.startTime) : null,
        endTime: validatedFields.data.endTime ? new Date(validatedFields.data.endTime) : null,
        checkAnswerEnabled: validatedFields.data.checkAnswerEnabled,
      }
    })

    revalidatePath('/admin/quiz')
    return {
      success: true,
      message: 'Quiz updated successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to update quiz',
    }
  }
}

export async function deleteQuizAction(quizId: string) {
  try {
    await db.quiz.delete({
      where: { id: quizId }
    })

    revalidatePath('/admin/quiz')
    return {
      success: true,
      message: 'Quiz deleted successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to delete quiz',
    }
  }
}

export async function enrollUsersAction(formData: FormData) {
  const rawData = {
    quizId: formData.get('quizId') as string,
    userIds: formData.getAll('userIds') as string[],
  }

  const validatedFields = quizEnrollmentSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    const enrollments = validatedFields.data.userIds.map(userId => ({
      quizId: validatedFields.data.quizId,
      userId,
    }))

    await db.quizUser.createMany({
      data: enrollments,
      skipDuplicates: true,
    })

    revalidatePath(`/admin/quiz/${validatedFields.data.quizId}/students`)
    return {
      success: true,
      message: 'Users enrolled successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to enroll users',
    }
  }
}
