
'use server'

import { db } from '@/lib/db'
import { createUserSchema, updateUserSchema, updateProfileSchema } from '@/schema/user'
import { hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function createUserAction(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as string,
    isActive: formData.get('isActive') === 'true',
  }

  const validatedFields = createUserSchema.safeParse(rawData)

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
        role: validatedFields.data.role,
        isActive: validatedFields.data.isActive,
      }
    })

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User created successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to create user',
    }
  }
}

export async function updateUserAction(userId: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as string,
    isActive: formData.get('isActive') === 'true',
  }

  const validatedFields = updateUserSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    const updateData: any = {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      phone: validatedFields.data.phone || null,
      role: validatedFields.data.role,
      isActive: validatedFields.data.isActive,
    }

    if (validatedFields.data.password) {
      updateData.password = await hash(validatedFields.data.password, 12)
    }

    await db.user.update({
      where: { id: userId },
      data: updateData
    })

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User updated successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to update user',
    }
  }
}

export async function updateProfileAction(userId: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
  }

  const validatedFields = updateProfileSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid fields',
    }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name: validatedFields.data.name,
        phone: validatedFields.data.phone || null,
      }
    })

    revalidatePath('/user/settings')
    return {
      success: true,
      message: 'Profile updated successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to update profile',
    }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId }
    })

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    return {
      message: 'Failed to delete user',
    }
  }
}
