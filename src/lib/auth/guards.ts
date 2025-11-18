import { createLogger } from '@/lib/logger'
import { getCurrentUser } from './get-session'

const guardLogger = createLogger({ scope: 'auth-guard' })

/**
 * Verifies authentication without redirecting.
 * Middleware handles redirects, this only validates and logs.
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    guardLogger.warn(
      'Auth guard called but user not authenticated (middleware should have redirected)',
    )
    return null
  }

  guardLogger.debug({ userId: user.id }, 'Authenticated user accessing protected route')
  return user
}

/**
 * Verifies guest status without redirecting.
 * Middleware handles redirects, this only validates and logs.
 */
export async function requireGuest() {
  const user = await getCurrentUser()

  if (user) {
    guardLogger.warn(
      { userId: user.id },
      'Guest guard called but user is authenticated (middleware should have redirected)',
    )
    return
  }

  guardLogger.debug('Guest user accessing auth page')
}
