
import { z } from 'zod'

// Update settings schema
export const updateSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  defaultQuizTimeLimit: z.number().positive().optional(),
  maxQuizAttempts: z.number().positive().optional(),
  showLeaderboard: z.boolean(),
  accentColor: z.string().optional(),
})
