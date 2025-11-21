import type { SurveyConfig, SurveyVisibility } from '@/lib/config/survey'
import { db } from '@/lib/db'
import { survey } from '@/lib/db/schema'
import type { ID } from '@/lib/db/types'
import { and, eq, inArray, or } from 'drizzle-orm'
import {
  buildOrderBy,
  checkExists,
  combineWithAnd,
  countEntities,
  createRepoLogger,
  deleteById,
  findById,
  findByIds,
  listAllEntities,
  listByColumn,
} from './base'

const REPO_NAME = 'survey'
const logger = createRepoLogger(REPO_NAME)

/**
 * Survey repository with functional composition
 * Pure functions composed for clean, testable database operations
 */
export const surveyRepo = {
  /**
   * Find survey by ID
   */
  byId: findById<typeof survey.$inferSelect>(survey, survey.id, REPO_NAME),

  /**
   * Find multiple surveys by IDs
   */
  byIds: findByIds<typeof survey.$inferSelect>(survey, survey.id, REPO_NAME),

  /**
   * Find surveys by creator ID
   */
  byCreator: listByColumn<typeof survey.$inferSelect, ID>(
    survey,
    survey.creatorId,
    survey.createdAt,
    REPO_NAME,
    'desc',
    'byCreator',
  ),

  /**
   * Create a new survey
   */
  async create(data: {
    title: string
    config: SurveyConfig
    visibility: SurveyVisibility
    creatorId: ID
  }) {
    try {
      const [created] = await db
        .insert(survey)
        .values({
          title: data.title,
          config: data.config,
          visibility: data.visibility,
          creatorId: data.creatorId,
        })
        .returning()
      logger.info({ surveyId: created.id, creatorId: data.creatorId }, 'create')
      return created
    } catch (error) {
      logger.error({ error, data }, 'create failed')
      throw error
    }
  },

  /**
   * Update existing survey
   */
  async update(
    id: ID,
    data: Partial<{
      title: string
      config: SurveyConfig
      visibility: SurveyVisibility
    }>,
  ) {
    try {
      const [updated] = await db.update(survey).set(data).where(eq(survey.id, id)).returning()
      const result = updated ?? null
      logger.info({ surveyId: id, updated: !!result }, 'update')
      return result
    } catch (error) {
      logger.error({ error, id, data }, 'update failed')
      throw error
    }
  },

  /**
   * Delete survey by ID
   */
  delete: deleteById<typeof survey.$inferSelect>(survey, survey.id, REPO_NAME),

  /**
   * List all public surveys
   */
  async listPublic() {
    try {
      const rows = await db
        .select()
        .from(survey)
        .where(eq(survey.visibility, 'public'))
        .orderBy(buildOrderBy(survey.createdAt, 'desc'))
      logger.debug({ count: rows.length }, 'listPublic')
      return rows
    } catch (error) {
      logger.error({ error }, 'listPublic failed')
      throw error
    }
  },

  /**
   * List all surveys
   */
  listAll: listAllEntities<typeof survey.$inferSelect>(survey, survey.createdAt, REPO_NAME),

  /**
   * Check if survey exists
   */
  exists: checkExists(survey, survey.id, REPO_NAME),

  /**
   * Count total surveys
   */
  count: countEntities(survey, REPO_NAME),

  /**
   * List surveys by visibility with optional creator filter
   */
  async listByVisibility(visibility: SurveyVisibility | SurveyVisibility[], creatorId?: ID) {
    try {
      const visibilities = Array.isArray(visibility) ? visibility : [visibility]
      const conditions = [inArray(survey.visibility, visibilities)]

      if (creatorId) {
        conditions.push(eq(survey.creatorId, creatorId))
      }

      const whereClause = combineWithAnd(conditions)
      const rows = await db
        .select()
        .from(survey)
        .where(whereClause)
        .orderBy(buildOrderBy(survey.createdAt, 'desc'))

      logger.debug({ visibility, creatorId, count: rows.length }, 'listByVisibility')
      return rows
    } catch (error) {
      logger.error({ error, visibility, creatorId }, 'listByVisibility failed')
      throw error
    }
  },

  /**
   * Find surveys accessible by user (creator or public)
   */
  async findAccessibleByUser(userId: ID, surveyIds: ID[]) {
    if (surveyIds.length === 0) return []

    try {
      const rows = await db
        .select()
        .from(survey)
        .where(
          and(
            inArray(survey.id, surveyIds),
            or(eq(survey.creatorId, userId), eq(survey.visibility, 'public')),
          ),
        )
      logger.debug(
        { userId, surveyIds: surveyIds.length, found: rows.length },
        'findAccessibleByUser',
      )
      return rows
    } catch (error) {
      logger.error(
        { error, userId, surveyIdsCount: surveyIds.length },
        'findAccessibleByUser failed',
      )
      throw error
    }
  },
}
