import { UserRoleSchema } from '@/lib/config/user'
import { AppError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { userService } from '@/lib/services/user.service'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const registerLogger = createLogger({ scope: 'register-api' })

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema.optional().default('user'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      registerLogger.warn({ issues: parsed.error.issues }, 'Invalid registration payload')
      return NextResponse.json(
        { message: 'Invalid request data', errors: parsed.error.issues },
        { status: 400 },
      )
    }

    const { email, password, role } = parsed.data

    const user = await userService.register(email, password, role)

    registerLogger.info({ userId: user.id, role: user.role }, 'User registered successfully')

    return NextResponse.json(
      { message: 'Account created successfully', user: { id: user.id, email: user.email } },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof AppError) {
      registerLogger.warn({ err }, 'Registration failed with expected error')
      return NextResponse.json({ message: err.message }, { status: err.statusCode })
    }

    registerLogger.error({ err }, 'Registration failed with unexpected error')
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
