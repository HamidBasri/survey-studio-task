import { hashPassword, verifyPassword } from '@/lib/auth/hash'
import type { AuthUser } from '@/lib/auth/types'
import { type UserRole } from '@/lib/config/user'
import { AppError, ConflictError, InternalError, ValidationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { userRepo } from '@/lib/repositories/user.repo'

const userServiceLogger = createLogger({ scope: 'userService' })

const MIN_PASSWORD_LENGTH = 8

export const userService = {
  async register(email: string, password: string, role: UserRole = 'user'): Promise<AuthUser> {
    try {
      const normalisedEmail = email.trim().toLowerCase()

      if (!normalisedEmail) {
        throw new ValidationError('Email is required', { code: 'EMAIL_REQUIRED' })
      }

      if (!password || password.length < MIN_PASSWORD_LENGTH) {
        throw new ValidationError('Password does not meet minimum length requirements', {
          code: 'PASSWORD_TOO_SHORT',
        })
      }

      const existing = await userRepo.byEmail(normalisedEmail)
      if (existing) {
        userServiceLogger.info(
          { email: normalisedEmail },
          'Attempt to register with existing email',
        )
        throw new ConflictError('Email is already in use', { code: 'EMAIL_TAKEN' })
      }

      const hashed = await hashPassword(password)
      const u = await userRepo.create(normalisedEmail, hashed, role)

      userServiceLogger.info({ userId: u.id, role: u.role }, 'User registered')

      return { id: u.id, email: u.email, role: u.role }
    } catch (err) {
      if (err instanceof AppError) {
        userServiceLogger.warn({ err }, 'User registration failed with expected error')
        throw err
      }

      userServiceLogger.error({ err }, 'User registration failed')
      throw new InternalError('User registration failed', { code: 'USER_REGISTER_FAILED' })
    }
  },

  async authenticate(email: string, password: string): Promise<AuthUser | null> {
    const normalisedEmail = email.trim().toLowerCase()

    if (!normalisedEmail || !password) {
      userServiceLogger.debug(
        { email: normalisedEmail },
        'Missing email or password for authentication',
      )
      return null
    }

    try {
      const u = await userRepo.byEmail(normalisedEmail)
      if (!u) {
        userServiceLogger.debug({ email: normalisedEmail }, 'User not found during authentication')
        return null
      }

      const valid = await verifyPassword(password, u.passwordHash)
      if (!valid) {
        userServiceLogger.debug({ userId: u.id }, 'Invalid password during authentication')
        return null
      }

      userServiceLogger.debug({ userId: u.id }, 'User authenticated successfully')
      return { id: u.id, email: u.email, role: u.role }
    } catch (err) {
      if (err instanceof AppError) {
        userServiceLogger.warn({ err }, 'User authentication failed with expected error')
        throw err
      }

      userServiceLogger.error({ err }, 'User authentication failed')
      throw new InternalError('Authentication failed', { code: 'AUTH_FAILED' })
    }
  },
}
