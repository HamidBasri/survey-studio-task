import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { asyncHandler, AuthenticationError, AuthorisationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseService } from '@/lib/services/response.service'
import { NextRequest, NextResponse } from 'next/server'

const logger = createLogger({ scope: 'api:surveys:responses:delete' })

/**
 * DELETE /api/surveys/[id]/responses/[responseId]
 * Delete a specific response (admin only)
 */
export const DELETE = asyncHandler(
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; responseId: string }> },
  ) => {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new AuthenticationError()
    }

    if (currentUser.role !== USER_ROLE.ADMIN) {
      logger.warn(
        { userId: currentUser.id, role: currentUser.role },
        'Unauthorised response deletion attempt',
      )
      throw new AuthorisationError('Admin access required')
    }

    const { id: surveyId, responseId } = await params

    logger.info({ surveyId, responseId, userId: currentUser.id }, 'Deleting survey response')

    // Delete response using service (checks permissions internally)
    await responseService.deleteResponse(responseId, currentUser.id)

    logger.info({ surveyId, responseId }, 'Survey response deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Response deleted successfully',
    })
  },
)
