import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { db } from '@/lib/db'
import { response, survey } from '@/lib/db/schema'
import { asyncHandler, AuthenticationError, AuthorisationError, NotFoundError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { and, eq } from 'drizzle-orm'
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

    // Check if survey exists and user is the creator
    const [surveyRecord] = await db
      .select({
        id: survey.id,
        creatorId: survey.creatorId,
      })
      .from(survey)
      .where(eq(survey.id, surveyId))
      .limit(1)

    if (!surveyRecord) {
      throw new NotFoundError('Survey not found')
    }

    if (surveyRecord.creatorId !== currentUser.id) {
      logger.warn(
        { surveyId, userId: currentUser.id, creatorId: surveyRecord.creatorId },
        'User attempted to delete response for survey they did not create',
      )
      throw new AuthorisationError('You can only delete responses for surveys you created')
    }

    // Check if response exists and belongs to this survey
    const [responseRecord] = await db
      .select({ id: response.id })
      .from(response)
      .where(and(eq(response.id, responseId), eq(response.surveyId, surveyId)))
      .limit(1)

    if (!responseRecord) {
      throw new NotFoundError('Response not found')
    }

    // Delete the response
    await db.delete(response).where(eq(response.id, responseId))

    logger.info({ surveyId, responseId }, 'Survey response deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Response deleted successfully',
    })
  },
)
