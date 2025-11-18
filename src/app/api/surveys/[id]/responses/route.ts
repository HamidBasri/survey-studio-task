import { getCurrentUser } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { db } from '@/lib/db'
import { response, survey, user } from '@/lib/db/schema'
import { asyncHandler, AuthenticationError, AuthorisationError, NotFoundError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { eq } from 'drizzle-orm'
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

    // Check if survey exists and user is the creator
    const [surveyRecord] = await db
      .select({
        id: survey.id,
        title: survey.title,
        config: survey.config,
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
        'User attempted to access responses for survey they did not create',
      )
      throw new AuthorisationError('You can only view responses for surveys you created')
    }

    // Fetch all responses for this survey with user information
    const responses = await db
      .select({
        id: response.id,
        answers: response.answers,
        createdAt: response.createdAt,
        userId: response.userId,
        userEmail: user.email,
      })
      .from(response)
      .leftJoin(user, eq(response.userId, user.id))
      .where(eq(response.surveyId, surveyId))
      .orderBy(response.createdAt)

    logger.debug({ surveyId, count: responses.length }, 'Survey responses fetched successfully')

    return NextResponse.json({
      survey: {
        id: surveyRecord.id,
        title: surveyRecord.title,
        config: surveyRecord.config,
      },
      responses: responses.map((r) => ({
        id: r.id,
        answers: r.answers,
        createdAt: r.createdAt,
        user: r.userId
          ? {
              id: r.userId,
              email: r.userEmail || 'Unknown',
            }
          : null,
      })),
    })
  },
)
