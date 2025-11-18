import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { db } from '@/lib/db'
import { response, survey } from '@/lib/db/schema'
import { asyncHandler, AuthenticationError, AuthorisationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { eq } from 'drizzle-orm'
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

    // First, check if survey exists
    const [existingSurvey] = await db.select().from(survey).where(eq(survey.id, surveyId)).limit(1)

    if (!existingSurvey) {
      surveyLogger.warn({ surveyId }, 'Survey not found')
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Count responses before deletion
    const responseCount = await db.select().from(response).where(eq(response.surveyId, surveyId))

    // Delete all responses for this survey
    await db.delete(response).where(eq(response.surveyId, surveyId))

    // Delete the survey (surveyAssignments will cascade delete automatically)
    await db.delete(survey).where(eq(survey.id, surveyId))

    surveyLogger.info(
      { surveyId, userId: currentUser.id, responsesDeleted: responseCount.length },
      'Survey deleted successfully',
    )

    return NextResponse.json({
      message: 'Survey and all responses deleted successfully',
      deletedResponses: responseCount.length,
    })
  },
)
