
import { z } from 'zod'
import { QuestionType, DifficultyLevel } from '@prisma/client'

// Enums
export const QuestionTypeSchema = z.nativeEnum(QuestionType)
export const DifficultyLevelSchema = z.nativeEnum(DifficultyLevel)

// Question options schema
export const QuestionOptionsSchema = z.array(z.string()).min(1, "At least one option is required")

// Base Question Schema
export const QuestionSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  content: z.string(),
  type: QuestionTypeSchema,
  options: z.string(), // JSON string in database
  correctAnswer: z.string(),
  explanation: z.string().nullable(),
  difficulty: DifficultyLevelSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Question with parsed options
export const QuestionWithOptionsSchema = QuestionSchema.extend({
  options: QuestionOptionsSchema,
})

// Create question schema
export const CreateQuestionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: QuestionTypeSchema,
  options: QuestionOptionsSchema,
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  difficulty: DifficultyLevelSchema.default(DifficultyLevel.MEDIUM),
  categoryId: z.string().optional(),
  points: z.number().positive().default(1.0),
})

// Update question schema
export const UpdateQuestionSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: QuestionTypeSchema.optional(),
  options: QuestionOptionsSchema.optional(),
  correctAnswer: z.string().min(1).optional(),
  explanation: z.string().optional(),
  difficulty: DifficultyLevelSchema.optional(),
  isActive: z.boolean().optional(),
})

// Quiz Question Schema
export const QuizQuestionSchema = z.object({
  id: z.string().cuid(),
  quizId: z.string(),
  questionId: z.string(),
  order: z.number(),
  points: z.number(),
})

// Types
export type Question = z.infer<typeof QuestionSchema>
export type QuestionWithOptions = z.infer<typeof QuestionWithOptionsSchema>
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>
export type UpdateQuestion = z.infer<typeof UpdateQuestionSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
