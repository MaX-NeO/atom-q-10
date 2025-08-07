
import { z } from 'zod'
import { QuestionType, DifficultyLevel } from '@prisma/client'

// Create question schema
export const createQuestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.nativeEnum(QuestionType),
  options: z.array(z.string()).min(1, "At least one option is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  difficulty: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.MEDIUM),
  points: z.number().positive().default(1.0),
})

// Update question schema
export const updateQuestionSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  type: z.nativeEnum(QuestionType).optional(),
  options: z.array(z.string()).min(1, "At least one option is required").optional(),
  correctAnswer: z.string().min(1, "Correct answer is required").optional(),
  explanation: z.string().optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  isActive: z.boolean().optional(),
})

// Bulk import questions schema
export const bulkImportQuestionsSchema = z.object({
  questions: z.array(createQuestionSchema),
})
