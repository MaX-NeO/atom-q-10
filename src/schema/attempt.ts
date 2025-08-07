
import { z } from 'zod'

// Start quiz attempt schema
export const startQuizAttemptSchema = z.object({
  quizId: z.string().cuid(),
})

// Submit answer schema
export const submitAnswerSchema = z.object({
  questionId: z.string().cuid(),
  userAnswer: z.string().min(1, "Answer is required"),
  timeSpent: z.number().optional(),
})

// Submit quiz schema
export const submitQuizSchema = z.object({
  answers: z.array(submitAnswerSchema),
})
