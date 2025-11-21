import { getCurrentUser } from '@/lib/auth'
import { SurveyConfigSchema, type SurveyVisibility } from '@/lib/config/survey'
import { USER_ROLE } from '@/lib/config/user'
import { db } from '@/lib/db'
import { response, survey, surveyAssignment, user } from '@/lib/db/schema'
import {
  asyncHandler,
  AuthenticationError,
  AuthorisationError,
  ValidationError,
} from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { count, desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const surveyLogger = createLogger({ scope: 'api:surveys' })

const CreateSurveySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  config: SurveyConfigSchema,
  visibility: z.enum(['public', 'private']).default('public'),
  assignedUserIds: z
    .array(z.string().uuid('Invalid user ID'))
    .optional()
    .transform((value) => value ?? []),
})

/**
 * GET /api/surveys
 * List all surveys (admin only)
 */
export const GET = asyncHandler(async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new AuthenticationError()
  }

  if (currentUser.role !== USER_ROLE.ADMIN) {
    surveyLogger.warn(
      { userId: currentUser.id, role: currentUser.role },
      'Unauthorised survey list access attempt',
    )
    throw new AuthorisationError('Admin access required')
  }

  surveyLogger.info({ userId: currentUser.id }, 'Fetching all surveys')

  const surveys = await db
    .select({
      id: survey.id,
      title: survey.title,
      config: survey.config,
      visibility: survey.visibility,
      creatorId: survey.creatorId,
      createdAt: survey.createdAt,
    })
    .from(survey)
    .orderBy(desc(survey.createdAt))

  // Get response counts for each survey
  const responseCountMap = new Map<string, number>()
  if (surveys.length > 0) {
    const counts = await db
      .select({
        surveyId: response.surveyId,
        count: count(),
      })
      .from(response)
      .groupBy(response.surveyId)

    counts.forEach((rc) => {
      responseCountMap.set(rc.surveyId, Number(rc.count))
    })
  }

  // Get total user count (for public surveys)
  const [totalUsersResult] = await db.select({ count: count() }).from(user)
  const totalUsers = Number(totalUsersResult.count)

  // Get assignment counts for private surveys
  const assignmentCountMap = new Map<string, number>()
  if (surveys.length > 0) {
    const assignmentCounts = await db
      .select({
        surveyId: surveyAssignment.surveyId,
        count: count(),
      })
      .from(surveyAssignment)
      .groupBy(surveyAssignment.surveyId)

    assignmentCounts.forEach((ac) => {
      assignmentCountMap.set(ac.surveyId, Number(ac.count))
    })
  }

  // Combine surveys with response counts and assigned user counts
  const surveysWithMetadata = surveys.map((s) => ({
    ...s,
    responseCount: responseCountMap.get(s.id) || 0,
    assignedUserCount: s.visibility === 'public' ? totalUsers : assignmentCountMap.get(s.id) || 0,
  }))

  surveyLogger.debug({ count: surveysWithMetadata.length }, 'Surveys fetched successfully')

  return NextResponse.json({ surveys: surveysWithMetadata })
})

/**
 * POST /api/surveys
 * Create a new survey (admin only)
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    throw new AuthenticationError()
  }

  if (currentUser.role !== USER_ROLE.ADMIN) {
    surveyLogger.warn(
      { userId: currentUser.id, role: currentUser.role },
      'Unauthorised survey creation attempt',
    )
    throw new AuthorisationError('Admin access required')
  }

  surveyLogger.info({ userId: currentUser.id }, 'Creating new survey')

  const body = await request.json()
  const validatedData = CreateSurveySchema.parse(body)

  // Validate that the title from config matches the title field
  if (validatedData.config.title !== validatedData.title) {
    throw new ValidationError('Survey title must match config title')
  }

  const visibility: SurveyVisibility = validatedData.visibility

  // For private surveys, ensure there is at least one assigned user
  if (visibility === 'private' && validatedData.assignedUserIds.length === 0) {
    throw new ValidationError('At least one user must be assigned to a private survey')
  }

  const [newSurvey] = await db
    .insert(survey)
    .values({
      title: validatedData.title,
      config: validatedData.config,
      visibility,
      creatorId: currentUser.id,
    })
    .returning()

  // Create survey assignments when requested for private surveys
  if (visibility === 'private' && validatedData.assignedUserIds.length > 0) {
    await db.insert(surveyAssignment).values(
      validatedData.assignedUserIds.map((userId) => ({
        surveyId: newSurvey.id,
        userId,
      })),
    )
  }

  surveyLogger.info(
    { surveyId: newSurvey.id, title: newSurvey.title },
    'Survey created successfully',
  )

  return NextResponse.json({ survey: newSurvey }, { status: 201 })
})
