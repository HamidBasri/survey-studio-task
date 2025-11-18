import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { response, survey, surveyAssignment } from '@/lib/db/schema'
import { asyncHandler, AuthenticationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { and, desc, eq, or } from 'drizzle-orm'
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

  // Fetch surveys that are either public OR assigned to the user
  const userSurveys = await db
    .select({
      id: survey.id,
      title: survey.title,
      config: survey.config,
      visibility: survey.visibility,
      creatorId: survey.creatorId,
      createdAt: survey.createdAt,
      assignmentId: surveyAssignment.id,
    })
    .from(survey)
    .leftJoin(surveyAssignment, eq(surveyAssignment.surveyId, survey.id))
    .where(or(eq(survey.visibility, 'public'), and(eq(surveyAssignment.userId, user.id))))
    .orderBy(desc(survey.createdAt))

  // Remove duplicate surveys (can appear if both public and assigned)
  const uniqueSurveys = Array.from(new Map(userSurveys.map((s) => [s.id, s])).values())

  // Fetch user's responses to determine submission status
  const userResponses = await db
    .select({
      surveyId: response.surveyId,
      createdAt: response.createdAt,
    })
    .from(response)
    .where(and(eq(response.userId, user.id)))

  // Create a map of submitted surveys
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

  logger.debug(
    { count: surveysWithStatus.length, userId: user.id },
    'User surveys fetched successfully',
  )

  return NextResponse.json({ surveys: surveysWithStatus })
})
