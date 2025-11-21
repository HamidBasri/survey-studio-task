import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { asyncHandler, AuthenticationError, AuthorisationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseService } from '@/lib/services/response.service'
import { NextRequest, NextResponse } from 'next/server'

const logger = createLogger({ scope: 'api:surveys:responses' })

/**
 * GET /api/surveys/[id]/responses
 * Fetch all responses for a specific survey (admin only)
 */
export const GET = asyncHandler(
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new AuthenticationError()
    }

    if (currentUser.role !== USER_ROLE.ADMIN) {
      logger.warn(
        { userId: currentUser.id, role: currentUser.role },
        'Unauthorised survey responses access attempt',
      )
      throw new AuthorisationError('Admin access required')
    }

    const { id: surveyId } = await params

    logger.info({ surveyId, userId: currentUser.id }, 'Fetching survey responses')

    const result = await responseService.listSurveyResponsesWithUserInfo(surveyId, currentUser.id)

    logger.debug(
      { surveyId, count: result.responses.length },
      'Survey responses fetched successfully',
    )

    return NextResponse.json(result)
  },
)
