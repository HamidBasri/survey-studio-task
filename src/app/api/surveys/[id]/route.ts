import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { asyncHandler, AuthenticationError, AuthorisationError, NotFoundError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseService } from '@/lib/services/response.service'
import { surveyService } from '@/lib/services/survey.service'
import { NextResponse } from 'next/server'

const surveyLogger = createLogger({ scope: 'api:surveys:id' })

/**
 * DELETE /api/surveys/[id]
 * Delete a survey and all its responses (admin only)
 */
export const DELETE = asyncHandler(
  async (_request: Request, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const surveyId = params.id

    const currentUser = await getCurrentUser()

    if (!currentUser) {
      throw new AuthenticationError()
    }

    if (currentUser.role !== USER_ROLE.ADMIN) {
      surveyLogger.warn(
        { userId: currentUser.id, role: currentUser.role, surveyId },
        'Unauthorised survey deletion attempt',
      )
      throw new AuthorisationError('Admin access required')
    }

    surveyLogger.info({ userId: currentUser.id, surveyId }, 'Deleting survey and all responses')

    // Get response count before deletion
    const responseCount = await responseService.getResponseCount(surveyId)

    // Delete survey using service (this will cascade delete responses and assignments)
    try {
      await surveyService.deleteSurvey(surveyId, currentUser.id)
    } catch (error) {
      if (error instanceof NotFoundError) {
        surveyLogger.warn({ surveyId }, 'Survey not found')
        return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
      }
      throw error
    }

    surveyLogger.info(
      { surveyId, userId: currentUser.id, responsesDeleted: responseCount },
      'Survey deleted successfully',
    )

    return NextResponse.json({
      message: 'Survey and all responses deleted successfully',
      deletedResponses: responseCount,
    })
  },
)
