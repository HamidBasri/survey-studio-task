import { getCurrentUser } from '@/lib/auth'
import { asyncHandler, AuthenticationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseService } from '@/lib/services/response.service'
import { surveyService } from '@/lib/services/survey.service'
import { NextResponse } from 'next/server'

const logger = createLogger({ scope: 'api:user:surveys' })

/**
 * GET /api/user/surveys
 * List all surveys available to the current user (public + assigned)
 * Includes submission status
 */
export const GET = asyncHandler(async () => {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  logger.info({ userId: user.id }, 'Fetching user surveys')

  // Fetch public surveys and assigned surveys
  const publicSurveys = await surveyService.listPublicSurveys()
  const assignedSurveys = await surveyService.listAssignedSurveys(user.id)

  // Combine and deduplicate
  const allSurveysMap = new Map()
  publicSurveys.forEach((s) => allSurveysMap.set(s.id, s))
  assignedSurveys.forEach((s) => allSurveysMap.set(s.id, s))
  const uniqueSurveys = Array.from(allSurveysMap.values())

  // Get user's responses
  const userResponses = await responseService.listUserResponses(user.id)
  const submittedSurveys = new Map(userResponses.map((r) => [r.surveyId, r.createdAt]))

  // Combine survey data with submission status
  const surveysWithStatus = uniqueSurveys.map((s) => ({
    id: s.id,
    title: s.title,
    config: s.config,
    visibility: s.visibility,
    creatorId: s.creatorId,
    createdAt: s.createdAt,
    isSubmitted: submittedSurveys.has(s.id),
    submittedAt: submittedSurveys.get(s.id) || null,
  }))

  // Sort surveys from newest to oldest by creation date
  surveysWithStatus.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  logger.debug(
    { count: surveysWithStatus.length, userId: user.id },
    'User surveys fetched successfully',
  )

  return NextResponse.json({ surveys: surveysWithStatus })
})
