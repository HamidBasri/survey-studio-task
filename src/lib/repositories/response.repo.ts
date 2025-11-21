import { db } from '@/lib/db'
import { response } from '@/lib/db/schema'
import type { ID, Json } from '@/lib/db/types'
import { and, eq } from 'drizzle-orm'
import {
  checkExists,
  countEntities,
  createRepoLogger,
  deleteById,
  findById,
  listAllEntities,
  listByColumn,
  listByColumnInArray,
} from './base'

const REPO_NAME = 'response'
const logger = createRepoLogger(REPO_NAME)

/**
 * Response repository with functional composition
 * Pure functions for managing survey responses
 */
export const responseRepo = {
  /**
   * Find response by ID
   */
  byId: findById<typeof response.$inferSelect>(response, response.id, REPO_NAME),

  /**
   * Find all responses for a survey
   */
  bySurvey: listByColumn<typeof response.$inferSelect, ID>(
    response,
    response.surveyId,
    response.createdAt,
    REPO_NAME,
    'desc',
    'bySurvey',
  ),

  /**
   * Find all responses by a user
   */
  byUser: listByColumn<typeof response.$inferSelect, ID>(
    response,
    response.userId,
    response.createdAt,
    REPO_NAME,
    'desc',
    'byUser',
  ),

  /**
   * Find response for a specific survey and user
   */
  async bySurveyAndUser(surveyId: ID, userId: ID) {
    try {
      const rows = await db
        .select()
        .from(response)
        .where(and(eq(response.surveyId, surveyId), eq(response.userId, userId)))
        .limit(1)
      const result = rows[0] ?? null
      logger.debug({ surveyId, userId, found: !!result }, 'bySurveyAndUser')
      return result
    } catch (error) {
      logger.error({ error, surveyId, userId }, 'bySurveyAndUser failed')
      throw error
    }
  },

  /**
   * Create a new response
   */
  async create(data: { surveyId: ID; userId: ID | null; answers: Record<string, Json> }) {
    try {
      const [created] = await db
        .insert(response)
        .values({
          surveyId: data.surveyId,
          userId: data.userId,
          answers: data.answers,
        })
        .returning()
      logger.info(
        { responseId: created.id, surveyId: data.surveyId, userId: data.userId },
        'create',
      )
      return created
    } catch (error) {
      logger.error({ error, data }, 'create failed')
      throw error
    }
  },

  /**
   * Update response answers
   */
  async update(id: ID, answers: Record<string, Json>) {
    try {
      const [updated] = await db
        .update(response)
        .set({ answers })
        .where(eq(response.id, id))
        .returning()
      const result = updated ?? null
      logger.info({ responseId: id, updated: !!result }, 'update')
      return result
    } catch (error) {
      logger.error({ error, id }, 'update failed')
      throw error
    }
  },

  /**
   * Delete response by ID
   */
  delete: deleteById<typeof response.$inferSelect>(response, response.id, REPO_NAME),

  /**
   * Count responses for a survey
   */
  async count(surveyId: ID): Promise<number> {
    try {
      const rows = await db
        .select({ id: response.id })
        .from(response)
        .where(eq(response.surveyId, surveyId))
      const total = rows.length
      logger.debug({ surveyId, count: total }, 'count')
      return total
    } catch (error) {
      logger.error({ error, surveyId }, 'count failed')
      throw error
    }
  },

  /**
   * Check if response exists
   */
  exists: checkExists(response, response.id, REPO_NAME),

  /**
   * Check if user has responded to a survey
   */
  async hasUserResponded(surveyId: ID, userId: ID): Promise<boolean> {
    try {
      const rows = await db
        .select({ id: response.id })
        .from(response)
        .where(and(eq(response.surveyId, surveyId), eq(response.userId, userId)))
        .limit(1)
      const result = rows.length > 0
      logger.debug({ surveyId, userId, hasResponded: result }, 'hasUserResponded')
      return result
    } catch (error) {
      logger.error({ error, surveyId, userId }, 'hasUserResponded failed')
      throw error
    }
  },

  /**
   * List all responses
   */
  listAll: listAllEntities<typeof response.$inferSelect>(response, response.createdAt, REPO_NAME),

  /**
   * Find responses for multiple surveys
   */
  bySurveys: listByColumnInArray<typeof response.$inferSelect, ID>(
    response,
    response.surveyId,
    response.createdAt,
    REPO_NAME,
    'desc',
    'bySurveys',
  ),

  /**
   * Count total responses
   */
  countAll: countEntities(response, REPO_NAME),
}
