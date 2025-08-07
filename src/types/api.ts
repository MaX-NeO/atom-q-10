
import { z } from 'zod'

// Generic API response schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  })

// Error response schema
export const ErrorResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
  statusCode: z.number().optional(),
})

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(10),
  total: z.number().optional(),
  totalPages: z.number().optional(),
})

// Search params schema
export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

// Statistics schema
export const StatsSchema = z.object({
  totalUsers: z.number(),
  totalQuizzes: z.number(),
  totalQuestions: z.number(),
  totalAttempts: z.number(),
  activeUsers: z.number().optional(),
  averageScore: z.number().optional(),
})

// Leaderboard entry schema
export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
  score: z.number(),
  attempts: z.number(),
  averageScore: z.number(),
})

// Recent activity schema
export const RecentActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['quiz_completed', 'quiz_started', 'quiz_created']),
  title: z.string(),
  description: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional(),
})

// Types
export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type Pagination = z.infer<typeof PaginationSchema>
export type SearchParams = z.infer<typeof SearchParamsSchema>
export type Stats = z.infer<typeof StatsSchema>
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>
export type RecentActivity = z.infer<typeof RecentActivitySchema>
