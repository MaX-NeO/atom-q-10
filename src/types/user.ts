
import { z } from 'zod'
import { UserRole } from '@prisma/client'

// Enums
export const UserRoleSchema = z.nativeEnum(UserRole)

// Base User Schema
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  password: z.string(),
  role: UserRoleSchema,
  avatar: z.string().nullable(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// User without password for API responses
export const SafeUserSchema = UserSchema.omit({ password: true })

// User creation schema
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: UserRoleSchema.optional().default(UserRole.USER),
  avatar: z.string().optional(),
  phone: z.string().optional(),
})

// User update schema
export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  role: UserRoleSchema.optional(),
})

// User profile update schema (for user settings)
export const UpdateUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
})

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Types
export type User = z.infer<typeof UserSchema>
export type SafeUser = z.infer<typeof SafeUserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>
export type ChangePassword = z.infer<typeof ChangePasswordSchema>
