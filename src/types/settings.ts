
import { z } from 'zod'

// Settings Schema
export const SettingsSchema = z.object({
  id: z.string().cuid(),
  siteTitle: z.string(),
  siteDescription: z.string(),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  enableGithubAuth: z.boolean(),
  accentColor: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Update settings schema
export const UpdateSettingsSchema = z.object({
  siteTitle: z.string().min(1).optional(),
  siteDescription: z.string().min(1).optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  enableGithubAuth: z.boolean().optional(),
  accentColor: z.string().optional(),
})

// User preferences schema
export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    quizReminders: z.boolean(),
  }),
  quizSettings: z.object({
    defaultDifficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    showTimer: z.boolean(),
    autoSave: z.boolean(),
  }),
})

// Types
export type Settings = z.infer<typeof SettingsSchema>
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
