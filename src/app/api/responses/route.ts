import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { response, survey } from '@/lib/db/schema'
import type { Json } from '@/lib/db/types'
import { asyncHandler, AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const logger = createLogger({ scope: 'api:responses' })

const CreateResponseSchema = z.object({
  surveyId: z.string().uuid('Invalid survey ID'),
  answers: z.record(z.string(), z.unknown()),
})

/**
 * POST /api/responses
 * Submit a survey response
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  logger.info({ userId: user.id }, 'Submitting survey response')

  const body = await request.json()
  const validatedData = CreateResponseSchema.parse(body)

  // Verify survey exists
  const [existingSurvey] = await db
    .select()
    .from(survey)
    .where(eq(survey.id, validatedData.surveyId))
    .limit(1)

  if (!existingSurvey) {
    throw new NotFoundError('Survey not found')
  }

  // Check if user has already submitted a response
  const [existingResponse] = await db
    .select()
    .from(response)
    .where(and(eq(response.surveyId, validatedData.surveyId), eq(response.userId, user.id)))
    .limit(1)

  if (existingResponse) {
    throw new ValidationError('You have already submitted a response to this survey')
  }

  // Create the response
  const [newResponse] = await db
    .insert(response)
    .values({
      surveyId: validatedData.surveyId,
      userId: user.id,
      answers: validatedData.answers as Record<string, Json>,
    })
    .returning()

  logger.info(
    { responseId: newResponse.id, surveyId: validatedData.surveyId, userId: user.id },
    'Survey response submitted successfully',
  )

  return NextResponse.json({ response: newResponse }, { status: 201 })
})
