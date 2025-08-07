
import { z } from 'zod'
import { DifficultyLevel, QuizStatus } from '@prisma/client'

// Create quiz schema
export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timeLimit: z.string().optional().transform((val) => val ? parseInt(val) : null),
  difficulty: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.MEDIUM),
  negativeMarking: z.boolean().default(false),
  negativePoints: z.string().optional().transform((val) => val ? parseFloat(val) : null),
  randomOrder: z.boolean().default(false),
  maxAttempts: z.string().optional().transform((val) => val === "" ? null : val ? parseInt(val) : null),
  showAnswers: z.boolean().default(false),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  checkAnswerEnabled: z.boolean().default(false),
})

// Update quiz schema
export const updateQuizSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  timeLimit: z.string().optional().transform((val) => val ? parseInt(val) : null),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  status: z.nativeEnum(QuizStatus).optional(),
  negativeMarking: z.boolean().optional(),
  negativePoints: z.string().optional().transform((val) => val ? parseFloat(val) : null),
  randomOrder: z.boolean().optional(),
  maxAttempts: z.string().optional().transform((val) => val === "" ? null : val ? parseInt(val) : null),
  showAnswers: z.boolean().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  checkAnswerEnabled: z.boolean().optional(),
})

// Quiz enrollment schema
export const quizEnrollmentSchema = z.object({
  quizId: z.string().cuid(),
  userIds: z.array(z.string().cuid()).min(1, "At least one user is required"),
})
