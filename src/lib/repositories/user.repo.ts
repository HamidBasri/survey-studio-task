import type { UserRole } from '@/lib/config/user'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema/user'
import { eq } from 'drizzle-orm'
import {
  buildOrderBy,
  checkExists,
  countEntities,
  createRepoLogger,
  deleteById,
  findById,
  findByIds,
} from './base'

const REPO_NAME = 'user'
const logger = createRepoLogger(REPO_NAME)

/**
 * User repository with functional composition
 */
export const userRepo = {
  /**
   * Find user by ID
   */
  byId: findById<typeof user.$inferSelect>(user, user.id, REPO_NAME),

  /**
   * Find multiple users by IDs
   */
  byIds: findByIds<typeof user.$inferSelect>(user, user.id, REPO_NAME),

  /**
   * Find user by email
   */
  async byEmail(email: string) {
    try {
      const rows = await db.select().from(user).where(eq(user.email, email)).limit(1)
      const result = rows[0] ?? null
      logger.debug({ email, found: !!result }, 'byEmail')
      return result
    } catch (error) {
      logger.error({ error, email }, 'byEmail failed')
      throw error
    }
  },

  /**
   * Create a new user
   */
  async create(email: string, passwordHash: string, role: UserRole = 'user') {
    try {
      const [createdUser] = await db.insert(user).values({ email, passwordHash, role }).returning()
      logger.info({ userId: createdUser.id, role }, 'create')
      return createdUser
    } catch (error) {
      logger.error({ error, email, role }, 'create failed')
      throw error
    }
  },

  /**
   * List all users
   */
  async listAll() {
    try {
      const rows = await db
        .select({
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(buildOrderBy(user.createdAt))
      logger.debug({ count: rows.length }, 'listAll')
      return rows
    } catch (error) {
      logger.error({ error }, 'listAll failed')
      throw error
    }
  },

  /**
   * Check if user exists
   */
  exists: checkExists(user, user.id, REPO_NAME),

  /**
   * Count total users
   */
  count: countEntities(user, REPO_NAME),

  /**
   * Delete user by ID
   */
  delete: deleteById<typeof user.$inferSelect>(user, user.id, REPO_NAME),
}
