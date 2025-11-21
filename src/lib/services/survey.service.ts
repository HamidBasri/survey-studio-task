import type { SurveyConfig, SurveyVisibility } from '@/lib/config/survey'
import type { ID } from '@/lib/db/types'
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

const surveyServiceLogger = createLogger({ scope: 'surveyService' })

export type SurveySummary = {
  id: ID
  title: string
  visibility: SurveyVisibility
  creatorId: ID
  createdAt: Date
}

export type SurveyDetail = SurveySummary & {
  config: SurveyConfig
}

export const surveyService = {
  async listAllSurveysWithStatsForAdmin(): Promise<
    Array<
      SurveyDetail & {
        responseCount: number
        assignedUserCount: number
      }
    >
  > {
    try {
      // Fetch all surveys
      const surveys = await surveyRepo.listAll()

      if (surveys.length === 0) {
        return []
      }

      const surveyIds = surveys.map((s) => s.id)

      // Fetch supporting data in parallel
      const [totalUsers, allResponses, allAssignments] = await Promise.all([
        userRepo.count(),
        responseRepo.bySurveys(surveyIds),
        surveyAssignmentRepo.bySurveys(surveyIds),
      ])

      // Build response count map
      const responseCountMap = new Map<ID, number>()
      for (const r of allResponses) {
        const current = responseCountMap.get(r.surveyId) ?? 0
        responseCountMap.set(r.surveyId, current + 1)
      }

      // Build assignment count map
      const assignmentCountMap = new Map<ID, number>()
      for (const a of allAssignments) {
        const current = assignmentCountMap.get(a.surveyId) ?? 0
        assignmentCountMap.set(a.surveyId, current + 1)
      }

      const surveysWithMetadata = surveys.map((s) => ({
        ...s,
        responseCount: responseCountMap.get(s.id) ?? 0,
        assignedUserCount:
          s.visibility === 'public' ? totalUsers : (assignmentCountMap.get(s.id) ?? 0),
      }))

      // Sort surveys from newest to oldest by creation date for admin views
      surveysWithMetadata.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )

      surveyServiceLogger.debug(
        { count: surveysWithMetadata.length },
        'Admin surveys with stats listed',
      )

      return surveysWithMetadata
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err }, 'Failed to list surveys with stats for admin')
      throw new InternalError('Failed to list surveys', { code: 'SURVEY_LIST_ADMIN_FAILED' })
    }
  },

  async getSurveyById(id: ID, requestUserId?: ID): Promise<SurveyDetail> {
    try {
      const survey = await surveyRepo.byId(id)

      if (!survey) {
        throw new NotFoundError('Survey not found')
      }

      // Check access permissions
      if (survey.visibility === 'private' && survey.creatorId !== requestUserId) {
        // Check if user has an assignment
        if (requestUserId) {
          const hasAssignment = await surveyAssignmentRepo.exists(id, requestUserId)
          if (!hasAssignment) {
            throw new AuthorisationError('You do not have access to this survey')
          }
        } else {
          throw new AuthorisationError('You do not have access to this survey')
        }
      }

      surveyServiceLogger.debug({ surveyId: id, userId: requestUserId }, 'Survey retrieved')

      return survey
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err, surveyId: id }, 'Failed to get survey')
      throw new InternalError('Failed to retrieve survey', { code: 'SURVEY_GET_FAILED' })
    }
  },

  async createSurvey(data: {
    title: string
    config: SurveyConfig
    visibility: SurveyVisibility
    creatorId: ID
  }): Promise<SurveyDetail> {
    try {
      if (!data.title?.trim()) {
        throw new ValidationError('Survey title is required', { code: 'TITLE_REQUIRED' })
      }

      if (!data.config?.questions || data.config.questions.length === 0) {
        throw new ValidationError('Survey must have at least one question', {
          code: 'NO_QUESTIONS',
        })
      }

      const survey = await surveyRepo.create({
        title: data.title.trim(),
        config: data.config,
        visibility: data.visibility || 'private',
        creatorId: data.creatorId,
      })

      surveyServiceLogger.info({ surveyId: survey.id, creatorId: data.creatorId }, 'Survey created')

      return survey
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err }, 'Failed to create survey')
      throw new InternalError('Failed to create survey', { code: 'SURVEY_CREATE_FAILED' })
    }
  },

  async updateSurvey(
    id: ID,
    data: Partial<{
      title: string
      config: SurveyConfig
      visibility: SurveyVisibility
    }>,
    requestUserId: ID,
  ): Promise<SurveyDetail> {
    try {
      const existing = await surveyRepo.byId(id)

      if (!existing) {
        throw new NotFoundError('Survey not found')
      }

      if (existing.creatorId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to update this survey')
      }

      if (data.title !== undefined && !data.title.trim()) {
        throw new ValidationError('Survey title cannot be empty', { code: 'TITLE_EMPTY' })
      }

      if (data.config !== undefined) {
        if (!data.config.questions || data.config.questions.length === 0) {
          throw new ValidationError('Survey must have at least one question', {
            code: 'NO_QUESTIONS',
          })
        }
      }

      const updateData: Partial<{
        title: string
        config: SurveyConfig
        visibility: SurveyVisibility
      }> = {}

      if (data.title !== undefined) updateData.title = data.title.trim()
      if (data.config !== undefined) updateData.config = data.config
      if (data.visibility !== undefined) updateData.visibility = data.visibility

      const updated = await surveyRepo.update(id, updateData)

      if (!updated) {
        throw new InternalError('Failed to update survey', { code: 'SURVEY_UPDATE_FAILED' })
      }

      surveyServiceLogger.info({ surveyId: id, userId: requestUserId }, 'Survey updated')

      return updated
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err, surveyId: id }, 'Failed to update survey')
      throw new InternalError('Failed to update survey', { code: 'SURVEY_UPDATE_FAILED' })
    }
  },

  async deleteSurvey(id: ID, requestUserId: ID): Promise<void> {
    try {
      const existing = await surveyRepo.byId(id)

      if (!existing) {
        throw new NotFoundError('Survey not found')
      }

      if (existing.creatorId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to delete this survey')
      }

      await surveyRepo.delete(id)

      surveyServiceLogger.info({ surveyId: id, userId: requestUserId }, 'Survey deleted')
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err, surveyId: id }, 'Failed to delete survey')
      throw new InternalError('Failed to delete survey', { code: 'SURVEY_DELETE_FAILED' })
    }
  },

  async listPublicSurveys(): Promise<readonly SurveyDetail[]> {
    try {
      const surveys = await surveyRepo.listPublic()

      surveyServiceLogger.debug({ count: surveys.length }, 'Public surveys listed')

      return surveys
    } catch (err) {
      surveyServiceLogger.error({ err }, 'Failed to list public surveys')
      throw new InternalError('Failed to list surveys', { code: 'SURVEY_LIST_FAILED' })
    }
  },

  async listUserSurveys(userId: ID): Promise<readonly SurveyDetail[]> {
    try {
      const surveys = await surveyRepo.byCreator(userId)

      surveyServiceLogger.debug({ userId, count: surveys.length }, 'User surveys listed')

      return surveys
    } catch (err) {
      surveyServiceLogger.error({ err, userId }, 'Failed to list user surveys')
      throw new InternalError('Failed to list user surveys', { code: 'SURVEY_LIST_FAILED' })
    }
  },

  async listAssignedSurveys(userId: ID): Promise<readonly SurveyDetail[]> {
    try {
      // Get assigned survey IDs
      const surveyIds = await surveyAssignmentRepo.getUserSurveyIds(userId)

      if (surveyIds.length === 0) {
        return []
      }

      // Get surveys
      const surveys = await surveyRepo.byIds(surveyIds)

      surveyServiceLogger.debug({ userId, count: surveys.length }, 'Assigned surveys listed')

      return surveys
    } catch (err) {
      surveyServiceLogger.error({ err, userId }, 'Failed to list assigned surveys')
      throw new InternalError('Failed to list assigned surveys', {
        code: 'SURVEY_LIST_ASSIGNED_FAILED',
      })
    }
  },

  async assignSurvey(surveyId: ID, userIds: ID[], requestUserId: ID): Promise<void> {
    try {
      const survey = await surveyRepo.byId(surveyId)

      if (!survey) {
        throw new NotFoundError('Survey not found')
      }

      if (survey.creatorId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to assign this survey')
      }

      if (userIds.length === 0) {
        throw new ValidationError('At least one user must be specified', {
          code: 'NO_USERS',
        })
      }

      const assignments = userIds.map((userId) => ({
        surveyId,
        userId,
      }))

      await surveyAssignmentRepo.createMany(assignments)

      surveyServiceLogger.info({ surveyId, userIds, requestUserId }, 'Survey assigned to users')
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err, surveyId }, 'Failed to assign survey')
      throw new InternalError('Failed to assign survey', { code: 'SURVEY_ASSIGN_FAILED' })
    }
  },

  async unassignSurvey(surveyId: ID, userId: ID, requestUserId: ID): Promise<void> {
    try {
      const survey = await surveyRepo.byId(surveyId)

      if (!survey) {
        throw new NotFoundError('Survey not found')
      }

      if (survey.creatorId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to unassign this survey')
      }

      await surveyAssignmentRepo.deleteBySurveyAndUser(surveyId, userId)

      surveyServiceLogger.info({ surveyId, userId, requestUserId }, 'Survey unassigned')
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err, surveyId, userId }, 'Failed to unassign survey')
      throw new InternalError('Failed to unassign survey', { code: 'SURVEY_UNASSIGN_FAILED' })
    }
  },

  async getAssignedUserIds(surveyId: ID, requestUserId: ID): Promise<ID[]> {
    try {
      const survey = await surveyRepo.byId(surveyId)

      if (!survey) {
        throw new NotFoundError('Survey not found')
      }

      if (survey.creatorId !== requestUserId) {
        throw new AuthorisationError('You do not have permission to view survey assignments')
      }

      const userIds = await surveyAssignmentRepo.getSurveyUserIds(surveyId)

      surveyServiceLogger.debug(
        { surveyId, count: userIds.length },
        'Survey assigned users retrieved',
      )

      return userIds
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      surveyServiceLogger.error({ err, surveyId }, 'Failed to get assigned users')
      throw new InternalError('Failed to get assigned users', {
        code: 'SURVEY_GET_ASSIGNED_FAILED',
      })
    }
  },
}
