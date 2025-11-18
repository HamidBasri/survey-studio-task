import type { AuthUser } from '@/lib/auth/types'
import { createLogger } from '@/lib/logger'
import { auth } from './auth-instance'

const sessionLogger = createLogger({ scope: 'session' })

export const getCurrentSession = async () => {
  try {
    const session = await auth()
    if (!session) {
      sessionLogger.debug('No active session')
      return null
    }

    sessionLogger.debug({ userId: session.user?.id }, 'Current session retrieved')
    return session
  } catch (error) {
    sessionLogger.error({ err: error }, 'Failed to get current session')
    return null
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const session = await auth()
    if (!session?.user) {
      sessionLogger.debug('No authenticated user on session')
      return null
    }

    sessionLogger.debug({ userId: session.user.id }, 'Current user retrieved')

    return session.user
  } catch (error) {
    sessionLogger.error({ err: error }, 'Failed to get current user')
    return null
  }
}
