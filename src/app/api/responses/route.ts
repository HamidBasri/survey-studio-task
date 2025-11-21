import { getCurrentUser } from '@/lib/auth'
import type { Json } from '@/lib/db/types'
import { asyncHandler, AuthenticationError } from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseService } from '@/lib/services/response.service'
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

  // Submit response using service
  const newResponse = await responseService.submitResponse({
    surveyId: validatedData.surveyId,
    userId: user.id,
    answers: validatedData.answers as Record<string, Json>,
  })

  logger.info(
    { responseId: newResponse.id, surveyId: validatedData.surveyId, userId: user.id },
    'Survey response submitted successfully',
  )

  return NextResponse.json({ response: newResponse }, { status: 201 })
})
