import type { SurveyVisibility } from '@/lib/config/survey'
import type { ID, Json } from '@/lib/db/types'
import {
  AppError,
  AuthorisationError,
  InternalError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors'
import { createLogger } from '@/lib/logger'
import { responseRepo } from '@/lib/repositories/response.repo'
import { surveyRepo } from '@/lib/repositories/survey.repo'
import { surveyAssignmentRepo } from '@/lib/repositories/surveyAssignment.repo'
import { userRepo } from '@/lib/repositories/user.repo'

const responseServiceLogger = createLogger({ scope: 'responseService' })

export type ResponseSummary = {
  id: ID
  surveyId: ID
  userId: ID | null
  createdAt: Date
}

export type ResponseDetail = ResponseSummary & {
  answers: Record<string, Json>
}

const ensureSurveyForResponses = async (surveyId: ID, requestUserId: ID) => {
  const survey = await surveyRepo.byId(surveyId)

  if (!survey) {
    throw new NotFoundError('Survey not found')
  }

  if (survey.creatorId !== requestUserId) {
    throw new AuthorisationError('You do not have permission to view survey responses')
  }

  return survey
}

const buildUserEmailMap = async (
  responses: readonly ResponseDetail[],
): Promise<Map<ID, string>> => {
  const userIds = responses.map((r) => r.userId).filter((id) => id !== null) as ID[]

  if (userIds.length === 0) {
    return new Map()
  }

  const uniqueUserIds = Array.from(new Set(userIds))
  const users = await userRepo.byIds(uniqueUserIds)
  const userEmailMap = new Map<ID, string>()

  users.forEach((u) => {
    userEmailMap.set(u.id as ID, u.email)
  })

  return userEmailMap
}

const ensureSurveyExists = async (surveyId: ID) => {
  const survey = await surveyRepo.byId(surveyId)

  if (!survey) {
    throw new NotFoundError('Survey not found')
  }

  return survey
}

const ensureUserCanSubmitToSurvey = async (
  survey: { visibility: SurveyVisibility },
  surveyId: ID,
  userId: ID,
): Promise<void> => {
  if (survey.visibility !== 'private') {
    return
  }

  const hasAssignment = await surveyAssignmentRepo.exists(surveyId, userId)

  if (!hasAssignment) {
    throw new AuthorisationError('You do not have access to this survey')
  }
}

const ensureNoExistingResponseForUser = async (surveyId: ID, userId: ID): Promise<void> => {
  const existingResponse = await responseRepo.bySurveyAndUser(surveyId, userId)

  if (existingResponse) {
    throw new ValidationError('You have already submitted a response to this survey', {
      code: 'RESPONSE_ALREADY_EXISTS',
    })
  }
}

const ensureAnswersNotEmpty = (answers: Record<string, Json>): void => {
  if (!answers || Object.keys(answers).length === 0) {
    throw new ValidationError('Response must contain answers', { code: 'NO_ANSWERS' })
  }
}

export const responseService = {
  async listSurveyResponsesWithUserInfo(
    surveyId: ID,
    requestUserId: ID,
  ): Promise<{
    survey: {
      id: ID
      title: string
      config: Json
    }
    responses: Array<{
      id: ID
      answers: Record<string, Json>
      createdAt: Date
      user: { id: ID; email: string } | null
    }>
  }> {
    try {
      const survey = await ensureSurveyForResponses(surveyId, requestUserId)
      const responses = await responseRepo.bySurvey(surveyId)
      const userEmailMap = await buildUserEmailMap(responses)

      responseServiceLogger.debug(
        { surveyId, count: responses.length },
        'Survey responses with user info listed',
      )

      return {
        survey: {
          id: survey.id,
          title: survey.title,
          config: survey.config as Json,
        },
        responses: responses.map((r) => ({
          id: r.id,
          answers: r.answers,
          createdAt: r.createdAt,
          user: r.userId
            ? {
                id: r.userId,
                email: userEmailMap.get(r.userId) ?? 'Unknown',
              }
            : null,
        })),
      }
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      responseServiceLogger.error(
        { err, surveyId },
        'Failed to list survey responses with user info',
      )
      throw new InternalError('Failed to list survey responses', {
        code: 'RESPONSE_LIST_WITH_USER_FAILED',
      })
    }
  },

  async getResponseById(id: ID, requestUserId?: ID): Promise<ResponseDetail> {
    try {
      const response = await responseRepo.byId(id)

      if (!response) {
        throw new NotFoundError('Response not found')
      }

      // Check access permissions
      const survey = await surveyRepo.byId(response.surveyId)
      if (!survey) {
        throw new NotFoundError('Associated survey not found')
      }

      // User can view their own response or if they created the survey
      const canView = response.userId === requestUserId || survey.creatorId === requestUserId

      if (!canView) {
        throw new AuthorisationError('You do not have access to this response')
      }

      responseServiceLogger.debug({ responseId: id, userId: requestUserId }, 'Response retrieved')

      return response
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      responseServiceLogger.error({ err, responseId: id }, 'Failed to get response')
      throw new InternalError('Failed to retrieve response', { code: 'RESPONSE_GET_FAILED' })
    }
  },

  async submitResponse(data: {
    surveyId: ID
    userId: ID
    answers: Record<string, Json>
  }): Promise<ResponseDetail> {
    try {
      // Verify survey exists
      const survey = await ensureSurveyExists(data.surveyId)

      // Check if user has access to submit (public or assigned)
      await ensureUserCanSubmitToSurvey(survey, data.surveyId, data.userId)

      // Check if user has already submitted a response
      await ensureNoExistingResponseForUser(data.surveyId, data.userId)

      // Validate answers
      ensureAnswersNotEmpty(data.answers)

      const response = await responseRepo.create({
        surveyId: data.surveyId,
        userId: data.userId,
        answers: data.answers,
      })

      responseServiceLogger.info(
        { responseId: response.id, surveyId: data.surveyId, userId: data.userId },
        'Response submitted',
      )

      return response
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      responseServiceLogger.error({ err }, 'Failed to submit response')
      throw new InternalError('Failed to submit response', { code: 'RESPONSE_SUBMIT_FAILED' })
    }
  },

  async updateResponse(
    id: ID,
    answers: Record<string, Json>,
    requestUserId: ID,
  ): Promise<ResponseDetail> {
    try {
      const existing = await responseRepo.byId(id)

      if (!existing) {
        throw new NotFoundError('Response not found')
      }

      // Only the user who created the response can update it
      if (existing.userId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to update this response')
      }

      if (!answers || Object.keys(answers).length === 0) {
        throw new ValidationError('Response must contain answers', { code: 'NO_ANSWERS' })
      }

      const updated = await responseRepo.update(id, answers)

      if (!updated) {
        throw new InternalError('Failed to update response', {
          code: 'RESPONSE_UPDATE_FAILED',
        })
      }

      responseServiceLogger.info({ responseId: id, userId: requestUserId }, 'Response updated')

      return updated
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      responseServiceLogger.error({ err, responseId: id }, 'Failed to update response')
      throw new InternalError('Failed to update response', { code: 'RESPONSE_UPDATE_FAILED' })
    }
  },

  async deleteResponse(id: ID, requestUserId: ID): Promise<void> {
    try {
      const existing = await responseRepo.byId(id)

      if (!existing) {
        throw new NotFoundError('Response not found')
      }

      // User can delete their own response or survey creator can delete
      const survey = await surveyRepo.byId(existing.surveyId)
      const canDelete = existing.userId === requestUserId || survey?.creatorId === requestUserId

      if (!canDelete) {
        throw new AuthorisationError('You do not have permission to delete this response')
      }

      await responseRepo.delete(id)

      responseServiceLogger.info({ responseId: id, userId: requestUserId }, 'Response deleted')
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      responseServiceLogger.error({ err, responseId: id }, 'Failed to delete response')
      throw new InternalError('Failed to delete response', { code: 'RESPONSE_DELETE_FAILED' })
    }
  },

  async listSurveyResponses(surveyId: ID, requestUserId: ID): Promise<readonly ResponseDetail[]> {
    try {
      const survey = await surveyRepo.byId(surveyId)

      if (!survey) {
        throw new NotFoundError('Survey not found')
      }

      // Only survey creator can view all responses
      if (survey.creatorId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to view survey responses')
      }

      const responses = await responseRepo.bySurvey(surveyId)

      responseServiceLogger.debug({ surveyId, count: responses.length }, 'Survey responses listed')

      return responses
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      responseServiceLogger.error({ err, surveyId }, 'Failed to list survey responses')
      throw new InternalError('Failed to list survey responses', {
        code: 'RESPONSE_LIST_FAILED',
      })
    }
  },

  async listUserResponses(userId: ID): Promise<readonly ResponseDetail[]> {
    try {
      const responses = await responseRepo.byUser(userId)

      responseServiceLogger.debug({ userId, count: responses.length }, 'User responses listed')

      return responses
    } catch (err) {
      responseServiceLogger.error({ err, userId }, 'Failed to list user responses')
      throw new InternalError('Failed to list user responses', {
        code: 'RESPONSE_LIST_FAILED',
      })
    }
  },

  async getUserResponseForSurvey(surveyId: ID, userId: ID): Promise<ResponseDetail | null> {
    try {
      const response = await responseRepo.bySurveyAndUser(surveyId, userId)

      if (response) {
        responseServiceLogger.debug({ surveyId, userId }, 'User response for survey retrieved')
      }

      return response
    } catch (err) {
      responseServiceLogger.error(
        { err, surveyId, userId },
        'Failed to get user response for survey',
      )
      throw new InternalError('Failed to get user response', {
        code: 'RESPONSE_GET_USER_FAILED',
      })
    }
  },

  async getResponseCount(surveyId: ID): Promise<number> {
    try {
      const count = await responseRepo.count(surveyId)

      responseServiceLogger.debug({ surveyId, count }, 'Response count retrieved')

      return count
    } catch (err) {
      responseServiceLogger.error({ err, surveyId }, 'Failed to get response count')
      throw new InternalError('Failed to get response count', {
        code: 'RESPONSE_COUNT_FAILED',
      })
    }
  },

  async hasUserResponded(surveyId: ID, userId: ID): Promise<boolean> {
    try {
      const hasResponded = await responseRepo.hasUserResponded(surveyId, userId)

      responseServiceLogger.debug({ surveyId, userId, hasResponded }, 'User response checked')

      return hasResponded
    } catch (err) {
      responseServiceLogger.error({ err, surveyId, userId }, 'Failed to check user response')
      throw new InternalError('Failed to check user response', {
        code: 'RESPONSE_CHECK_FAILED',
      })
    }
  },
}
