import { getCurrentUser } from '@/lib/auth'
import { SurveyConfigSchema } from '@/lib/config/survey'
import { USER_ROLE } from '@/lib/config/user'
import {
  asyncHandler,
  AuthenticationError,
  AuthorisationError,
  ValidationError,
} from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { surveyService } from '@/lib/services/survey.service'
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

  const surveysWithMetadata = await surveyService.listAllSurveysWithStatsForAdmin()

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

  // For private surveys, ensure there is at least one assigned user
  if (validatedData.visibility === 'private' && validatedData.assignedUserIds.length === 0) {
    throw new ValidationError('At least one user must be assigned to a private survey')
  }

  // Create survey using service
  const newSurvey = await surveyService.createSurvey({
    title: validatedData.title,
    config: validatedData.config,
    visibility: validatedData.visibility,
    creatorId: currentUser.id,
  })

  // Assign users if specified
  if (validatedData.assignedUserIds.length > 0) {
    await surveyService.assignSurvey(newSurvey.id, validatedData.assignedUserIds, currentUser.id)
  }

  surveyLogger.info(
    { surveyId: newSurvey.id, title: newSurvey.title },
    'Survey created successfully',
  )

  return NextResponse.json({ survey: newSurvey }, { status: 201 })
})
