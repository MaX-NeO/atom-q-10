
'use server'

import { signIn } from 'next-auth/react'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { loginSchema, registerSchema, changePasswordSchema } from '@/schema/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validatedFields = loginSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    const result = await signIn('credentials', {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    })

    if (result?.error) {
      return {
        message: 'Invalid credentials',
      }
    }

    revalidatePath('/')
    redirect('/')
  } catch (error) {
    return {
      message: 'Something went wrong',
    }
  }
}

export async function registerAction(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    phone: formData.get('phone') as string,
  }

  const validatedFields = registerSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: validatedFields.data.email }
    })

    if (existingUser) {
      return {
        message: 'User already exists with this email',
      }
    }

    const hashedPassword = await hash(validatedFields.data.password, 12)

    await db.user.create({
      data: {
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        password: hashedPassword,
        phone: validatedFields.data.phone || null,
      }
    })

    revalidatePath('/register')
    redirect('/')
  } catch (error) {
    return {
      message: 'Failed to create user',
    }
  }
}

export async function changePasswordAction(userId: string, formData: FormData) {
  const rawData = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const validatedFields = changePasswordSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return {
        message: 'User not found',
      }
    }

    const isValidPassword = await hash(validatedFields.data.currentPassword, 12) === user.password

    if (!isValidPassword) {
      return {
        message: 'Current password is incorrect',
      }
    }

    const hashedNewPassword = await hash(validatedFields.data.newPassword, 12)

    await db.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })

    revalidatePath('/user/settings')
    return {
      success: true,
      message: 'Password changed successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to change password',
    }
  }
}
