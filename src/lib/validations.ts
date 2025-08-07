
import { z } from 'zod'
import { NextRequest } from 'next/server'

// Validation helper function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError
} {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Validation middleware for API routes
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: boolean; data?: T; errors?: string[] }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, errors: ['Invalid JSON body'] }
  }
}

// Query params validation
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const params = Object.fromEntries(searchParams.entries())
    const result = schema.safeParse(params)
    
    if (!result.success) {
      const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      )
      return { success: false, errors }
    }
    
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, errors: ['Invalid query parameters'] }
  }
}

// Format validation errors for API responses
export function formatValidationErrors(errors: z.ZodError): string[] {
  return errors.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
}
