
'use server'

import { db } from '@/lib/db'
import { createQuestionSchema, updateQuestionSchema } from '@/schema/question'
import { revalidatePath } from 'next/cache'

export async function createQuestionAction(formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    type: formData.get('type') as string,
    options: formData.getAll('options') as string[],
    correctAnswer: formData.get('correctAnswer') as string,
    explanation: formData.get('explanation') as string,
    difficulty: formData.get('difficulty') as string,
    points: parseFloat(formData.get('points') as string) || 1.0,
  }

  const validatedFields = createQuestionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    await db.question.create({
      data: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        type: validatedFields.data.type,
        options: JSON.stringify(validatedFields.data.options),
        correctAnswer: validatedFields.data.correctAnswer,
        explanation: validatedFields.data.explanation || null,
        difficulty: validatedFields.data.difficulty,
      }
    })

    revalidatePath('/admin/questions')
    return {
      success: true,
      message: 'Question created successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to create question',
    }
  }
}

export async function updateQuestionAction(questionId: string, formData: FormData) {
  const rawData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    type: formData.get('type') as string,
    options: formData.getAll('options') as string[],
    correctAnswer: formData.get('correctAnswer') as string,
    explanation: formData.get('explanation') as string,
    difficulty: formData.get('difficulty') as string,
    isActive: formData.get('isActive') === 'true',
  }

  const validatedFields = updateQuestionSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    await db.question.update({
      where: { id: questionId },
      data: {
        title: validatedFields.data.title,
        content: validatedFields.data.content,
        type: validatedFields.data.type,
        options: validatedFields.data.options ? JSON.stringify(validatedFields.data.options) : undefined,
        correctAnswer: validatedFields.data.correctAnswer,
        explanation: validatedFields.data.explanation || null,
        difficulty: validatedFields.data.difficulty,
        isActive: validatedFields.data.isActive,
      }
    })

    revalidatePath('/admin/questions')
    return {
      success: true,
      message: 'Question updated successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to update question',
    }
  }
}

export async function deleteQuestionAction(questionId: string) {
  try {
    await db.question.delete({
      where: { id: questionId }
    })

    revalidatePath('/admin/questions')
    return {
      success: true,
      message: 'Question deleted successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to delete question',
    }
  }
}
