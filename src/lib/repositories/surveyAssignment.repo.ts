import { db } from '@/lib/db'
import { surveyAssignment } from '@/lib/db/schema'
import type { ID } from '@/lib/db/types'
import { and, eq } from 'drizzle-orm'
import {
  countEntities,
  createRepoLogger,
  deleteById,
  findById,
  listAllEntities,
  listByColumn,
  listByColumnInArray,
} from './base'

const REPO_NAME = 'surveyAssignment'
const logger = createRepoLogger(REPO_NAME)

/**
 * Survey Assignment repository with functional composition
 * Pure functions for managing survey-user assignments
 */
export const surveyAssignmentRepo = {
  /**
   * Find assignment by ID
   */
  byId: findById<typeof surveyAssignment.$inferSelect>(
    surveyAssignment,
    surveyAssignment.id,
    REPO_NAME,
  ),

  /**
   * Find all assignments for a survey
   */
  bySurvey: listByColumn<typeof surveyAssignment.$inferSelect, ID>(
    surveyAssignment,
    surveyAssignment.surveyId,
    surveyAssignment.assignedAt,
    REPO_NAME,
    'asc',
    'bySurvey',
  ),

  /**
   * Find all assignments for a user
   */
  byUser: listByColumn<typeof surveyAssignment.$inferSelect, ID>(
    surveyAssignment,
    surveyAssignment.userId,
    surveyAssignment.assignedAt,
    REPO_NAME,
    'desc',
    'byUser',
  ),

  /**
   * Find assignment for a specific survey and user
   */
  async bySurveyAndUser(surveyId: ID, userId: ID) {
    try {
      const rows = await db
        .select()
        .from(surveyAssignment)
        .where(and(eq(surveyAssignment.surveyId, surveyId), eq(surveyAssignment.userId, userId)))
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
   * Create a new assignment
   */
  async create(data: { surveyId: ID; userId: ID }) {
    try {
      const [created] = await db
        .insert(surveyAssignment)
        .values({
          surveyId: data.surveyId,
          userId: data.userId,
        })
        .returning()
      logger.info(
        { assignmentId: created.id, surveyId: data.surveyId, userId: data.userId },
        'create',
      )
      return created
    } catch (error) {
      logger.error({ error, data }, 'create failed')
      throw error
    }
  },

  /**
   * Create multiple assignments in bulk
   */
  async createMany(assignments: Array<{ surveyId: ID; userId: ID }>) {
    if (assignments.length === 0) return []

    try {
      const created = await db
        .insert(surveyAssignment)
        .values(assignments)
        .onConflictDoNothing()
        .returning()
      logger.info({ count: created.length, requested: assignments.length }, 'createMany')
      return created
    } catch (error) {
      logger.error({ error, count: assignments.length }, 'createMany failed')
      throw error
    }
  },

  /**
   * Delete assignment by ID
   */
  delete: deleteById<typeof surveyAssignment.$inferSelect>(
    surveyAssignment,
    surveyAssignment.id,
    REPO_NAME,
  ),

  /**
   * Delete assignment by survey and user
   */
  async deleteBySurveyAndUser(surveyId: ID, userId: ID) {
    try {
      const [deleted] = await db
        .delete(surveyAssignment)
        .where(and(eq(surveyAssignment.surveyId, surveyId), eq(surveyAssignment.userId, userId)))
        .returning()
      const result = deleted ?? null
      logger.info({ surveyId, userId, deleted: !!result }, 'deleteBySurveyAndUser')
      return result
    } catch (error) {
      logger.error({ error, surveyId, userId }, 'deleteBySurveyAndUser failed')
      throw error
    }
  },

  /**
   * Delete all assignments for a survey
   */
  async deleteBySurvey(surveyId: ID) {
    try {
      const deleted = await db
        .delete(surveyAssignment)
        .where(eq(surveyAssignment.surveyId, surveyId))
        .returning()
      logger.info({ surveyId, count: deleted.length }, 'deleteBySurvey')
      return deleted
    } catch (error) {
      logger.error({ error, surveyId }, 'deleteBySurvey failed')
      throw error
    }
  },

  /**
   * Check if assignment exists for survey and user
   */
  async exists(surveyId: ID, userId: ID): Promise<boolean> {
    try {
      const rows = await db
        .select({ id: surveyAssignment.id })
        .from(surveyAssignment)
        .where(and(eq(surveyAssignment.surveyId, surveyId), eq(surveyAssignment.userId, userId)))
        .limit(1)
      const result = rows.length > 0
      logger.debug({ surveyId, userId, exists: result }, 'exists')
      return result
    } catch (error) {
      logger.error({ error, surveyId, userId }, 'exists failed')
      throw error
    }
  },

  /**
   * Get all survey IDs assigned to a user
   */
  async getUserSurveyIds(userId: ID): Promise<ID[]> {
    try {
      const rows = await db
        .select({ surveyId: surveyAssignment.surveyId })
        .from(surveyAssignment)
        .where(eq(surveyAssignment.userId, userId))
      const surveyIds = rows.map((row) => row.surveyId)
      logger.debug({ userId, count: surveyIds.length }, 'getUserSurveyIds')
      return surveyIds
    } catch (error) {
      logger.error({ error, userId }, 'getUserSurveyIds failed')
      throw error
    }
  },

  /**
   * Get all user IDs assigned to a survey
   */
  async getSurveyUserIds(surveyId: ID): Promise<ID[]> {
    try {
      const rows = await db
        .select({ userId: surveyAssignment.userId })
        .from(surveyAssignment)
        .where(eq(surveyAssignment.surveyId, surveyId))
      const userIds = rows.map((row) => row.userId)
      logger.debug({ surveyId, count: userIds.length }, 'getSurveyUserIds')
      return userIds
    } catch (error) {
      logger.error({ error, surveyId }, 'getSurveyUserIds failed')
      throw error
    }
  },

  /**
   * List all assignments
   */
  listAll: listAllEntities<typeof surveyAssignment.$inferSelect>(
    surveyAssignment,
    surveyAssignment.assignedAt,
    REPO_NAME,
  ),

  /**
   * Find assignments for multiple surveys
   */
  bySurveys: listByColumnInArray<typeof surveyAssignment.$inferSelect, ID>(
    surveyAssignment,
    surveyAssignment.surveyId,
    surveyAssignment.assignedAt,
    REPO_NAME,
    'desc',
    'bySurveys',
  ),

  /**
   * Count total assignments
   */
  countAll: countEntities(surveyAssignment, REPO_NAME),
}
