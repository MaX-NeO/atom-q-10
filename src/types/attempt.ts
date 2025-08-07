
import { z } from 'zod'
import { AttemptStatus } from '@prisma/client'
import { SafeUserSchema } from './user'
import { QuizSchema } from './quiz'

// Enums
export const AttemptStatusSchema = z.nativeEnum(AttemptStatus)

// Quiz Attempt Schema
export const QuizAttemptSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  quizId: z.string(),
  status: AttemptStatusSchema,
  score: z.number().nullable(),
  totalPoints: z.number().nullable(),
  timeTaken: z.number().nullable(),
  startedAt: z.date().nullable(),
  submittedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Quiz Answer Schema
export const QuizAnswerSchema = z.object({
  id: z.string().cuid(),
  attemptId: z.string(),
  questionId: z.string(),
  userAnswer: z.string(),
  isCorrect: z.boolean().nullable(),
  pointsEarned: z.number().nullable(),
  timeSpent: z.number().nullable(),
  createdAt: z.date(),
})

// Quiz Attempt with relations
export const QuizAttemptWithRelationsSchema = QuizAttemptSchema.extend({
  user: SafeUserSchema,
  quiz: QuizSchema,
  answers: z.array(QuizAnswerSchema),
})

// Start quiz attempt schema
export const StartQuizAttemptSchema = z.object({
  quizId: z.string().cuid(),
})

// Submit answer schema
export const SubmitAnswerSchema = z.object({
  questionId: z.string().cuid(),
  userAnswer: z.string().min(1, "Answer is required"),
  timeSpent: z.number().optional(),
})

// Submit quiz schema
export const SubmitQuizSchema = z.object({
  answers: z.array(SubmitAnswerSchema),
})

// Quiz result schema
export const QuizResultSchema = z.object({
  attemptId: z.string(),
  score: z.number(),
  totalPoints: z.number(),
  percentage: z.number(),
  timeTaken: z.number().nullable(),
  submittedAt: z.date(),
  quiz: z.object({
    id: z.string(),
    title: z.string(),
    showAnswers: z.boolean(),
  }),
  answers: z.array(z.object({
    questionId: z.string(),
    userAnswer: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    pointsEarned: z.number(),
    question: z.object({
      title: z.string(),
      content: z.string(),
      explanation: z.string().nullable(),
      options: z.array(z.string()),
    }),
  })).optional(),
})

// Types
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>
export type QuizAttemptWithRelations = z.infer<typeof QuizAttemptWithRelationsSchema>
export type StartQuizAttempt = z.infer<typeof StartQuizAttemptSchema>
export type SubmitAnswer = z.infer<typeof SubmitAnswerSchema>
export type SubmitQuiz = z.infer<typeof SubmitQuizSchema>
export type QuizResult = z.infer<typeof QuizResultSchema>
