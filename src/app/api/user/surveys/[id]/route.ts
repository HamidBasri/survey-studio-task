'use server'

import { getCurrentUser } from '@/lib/auth'
import { asyncHandler, AuthenticationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseService } from '@/lib/services/response.service'
import { surveyService } from '@/lib/services/survey.service'
import { NextRequest, NextResponse } from 'next/server'

const logger = createLogger({ scope: 'api:user:surveys:id' })

/**
 * GET /api/user/surveys/[id]
 * Get a single survey available to the current user, including submission status.
 */
export const GET = asyncHandler(
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getCurrentUser()

    if (!user) {
      throw new AuthenticationError()
    }

    const { id: surveyId } = await params

    logger.info({ surveyId, userId: user.id }, 'Fetching user survey')

    // This enforces visibility and assignment rules internally
    const survey = await surveyService.getSurveyById(surveyId, user.id)

    const userResponse = await responseService.getUserResponseForSurvey(surveyId, user.id)

    const surveyWithStatus = {
      id: survey.id,
      title: survey.title,
      config: survey.config,
      visibility: survey.visibility,
      creatorId: survey.creatorId,
      createdAt: survey.createdAt,
      isSubmitted: !!userResponse,
      submittedAt: userResponse?.createdAt ?? null,
    }

    logger.debug(
      { surveyId, userId: user.id, isSubmitted: surveyWithStatus.isSubmitted },
      'User survey fetched successfully',
    )

    return NextResponse.json({ survey: surveyWithStatus })
  },
)
