import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { asyncHandler, AuthenticationError, AuthorisationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { userService } from '@/lib/services/user.service'
import { NextResponse } from 'next/server'

const usersLogger = createLogger({ scope: 'api:users' })

export const GET = asyncHandler(async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new AuthenticationError()
  }

  if (currentUser.role !== USER_ROLE.ADMIN) {
    usersLogger.warn(
      { userId: currentUser.id, role: currentUser.role },
      'Unauthorised user list access attempt',
    )
    throw new AuthorisationError('Admin access required')
  }

  usersLogger.info({ userId: currentUser.id }, 'Fetching users for admin')

  const users = await userService.listUsers()

  usersLogger.debug({ count: users.length }, 'Users fetched successfully')

  return NextResponse.json({ users })
})
