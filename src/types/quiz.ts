
import { z } from 'zod'
import { QuizStatus, DifficultyLevel } from '@prisma/client'
import { SafeUserSchema } from './user'
import { QuestionWithOptionsSchema } from './question'

// Enums
export const QuizStatusSchema = z.nativeEnum(QuizStatus)

// Base Quiz Schema
export const QuizSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string().nullable(),
  timeLimit: z.number().nullable(),
  difficulty: z.nativeEnum(DifficultyLevel),
  status: QuizStatusSchema,
  negativeMarking: z.boolean(),
  negativePoints: z.number().nullable(),
  randomOrder: z.boolean(),
  maxAttempts: z.number().nullable(),
  showAnswers: z.boolean(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  creatorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  checkAnswerEnabled: z.boolean(),
})

// Quiz with relations
export const QuizWithRelationsSchema = QuizSchema.extend({
  creator: SafeUserSchema,
  quizQuestions: z.array(z.object({
    id: z.string(),
    order: z.number(),
    points: z.number(),
    question: QuestionWithOptionsSchema,
  })),
  quizUsers: z.array(z.object({
    id: z.string(),
    user: SafeUserSchema,
  })),
  _count: z.object({
    quizQuestions: z.number(),
    quizAttempts: z.number(),
    quizUsers: z.number(),
  }).optional(),
})

// Create quiz schema
export const CreateQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timeLimit: z.number().positive().optional(),
  difficulty: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.MEDIUM),
  negativeMarking: z.boolean().default(false),
  negativePoints: z.number().optional(),
  randomOrder: z.boolean().default(false),
  maxAttempts: z.number().positive().optional(),
  showAnswers: z.boolean().default(false),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  checkAnswerEnabled: z.boolean().default(false),
})

// Update quiz schema
export const UpdateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  timeLimit: z.number().positive().optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  status: QuizStatusSchema.optional(),
  negativeMarking: z.boolean().optional(),
  negativePoints: z.number().optional(),
  randomOrder: z.boolean().optional(),
  maxAttempts: z.number().positive().optional(),
  showAnswers: z.boolean().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  checkAnswerEnabled: z.boolean().optional(),
})

// Quiz enrollment schema
export const QuizEnrollmentSchema = z.object({
  quizId: z.string().cuid(),
  userIds: z.array(z.string().cuid()).min(1, "At least one user is required"),
})

// User quiz summary for quiz list
export const UserQuizSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  timeLimit: z.number().nullable(),
  difficulty: z.nativeEnum(DifficultyLevel),
  maxAttempts: z.number().nullable(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  questionCount: z.number(),
  attempts: z.number(),
  bestScore: z.number().nullable(),
  lastAttemptDate: z.date().nullable(),
  canAttempt: z.boolean(),
  attemptStatus: z.string(),
  hasInProgress: z.boolean(),
})

// Types
export type Quiz = z.infer<typeof QuizSchema>
export type QuizWithRelations = z.infer<typeof QuizWithRelationsSchema>
export type CreateQuiz = z.infer<typeof CreateQuizSchema>
export type UpdateQuiz = z.infer<typeof UpdateQuizSchema>
export type QuizEnrollment = z.infer<typeof QuizEnrollmentSchema>
export type UserQuizSummary = z.infer<typeof UserQuizSummarySchema>
