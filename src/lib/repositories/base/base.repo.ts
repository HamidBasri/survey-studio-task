import { db } from '@/lib/db'
import type { ID } from '@/lib/db/types'
import { createLogger } from '@/lib/logger'
import { and, asc, count, desc, eq, inArray, or, type SQL } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'

/**
 * Functional repository utilities for composable database operations
 * These pure functions can be composed to create repository methods
 */

/**
 * Creates a logger for repository operations
 */
export const createRepoLogger = (repoName: string) => createLogger({ scope: `repo:${repoName}` })

/**
 * Pure function to retrieve entity by ID
 */
export const findById =
  <T>(table: PgTable, idColumn: PgColumn, repoName: string) =>
  async (id: ID): Promise<T | null> => {
    const logger = createRepoLogger(repoName)
    try {
      const rows = await db.select().from(table).where(eq(idColumn, id)).limit(1)
      const result = rows[0] as T | undefined
      logger.debug({ id, found: !!result }, `${repoName}.byId`)
      return result ?? null
    } catch (error) {
      logger.error({ error, id }, `${repoName}.byId failed`)
      throw error
    }
  }

/**
 * Pure function to retrieve multiple entities by IDs
 */
export const findByIds =
  <T>(table: PgTable, idColumn: PgColumn, repoName: string) =>
  async (ids: readonly ID[]): Promise<readonly T[]> => {
    if (ids.length === 0) return []
    const logger = createRepoLogger(repoName)
    try {
      const rows = await db
        .select()
        .from(table)
        .where(inArray(idColumn, [...ids]))
      logger.debug({ count: rows.length, requested: ids.length }, `${repoName}.byIds`)
      return rows as readonly T[]
    } catch (error) {
      logger.error({ error, idsCount: ids.length }, `${repoName}.byIds failed`)
      throw error
    }
  }

/**
 * Pure function to check if entity exists
 */
export const checkExists =
  (table: PgTable, idColumn: PgColumn, repoName: string) =>
  async (id: ID): Promise<boolean> => {
    const logger = createRepoLogger(repoName)
    try {
      const rows = await db.select({ id: idColumn }).from(table).where(eq(idColumn, id)).limit(1)
      const result = rows.length > 0
      logger.debug({ id, exists: result }, `${repoName}.exists`)
      return result
    } catch (error) {
      logger.error({ error, id }, `${repoName}.exists failed`)
      throw error
    }
  }

/**
 * Pure function to delete entity by ID
 */
export const deleteById =
  <T>(table: PgTable, idColumn: PgColumn, repoName: string) =>
  async (id: ID): Promise<T | null> => {
    const logger = createRepoLogger(repoName)
    try {
      const [deleted] = await db.delete(table).where(eq(idColumn, id)).returning()

      const result = deleted as T | undefined
      logger.info({ id, deleted: !!result }, `${repoName}.delete`)
      return result ?? null
    } catch (error) {
      logger.error({ error, id }, `${repoName}.delete failed`)
      throw error
    }
  }

/**
 * Pure function to count entities
 */
export const countEntities = (table: PgTable, repoName: string) => async (): Promise<number> => {
  const logger = createRepoLogger(repoName)
  try {
    const [result] = await db.select({ count: count() }).from(table)
    const total = Number(result?.count ?? 0)
    logger.debug({ count: total }, `${repoName}.count`)
    return total
  } catch (error) {
    logger.error({ error }, `${repoName}.count failed`)
    throw error
  }
}

/**
 * Pure function to list all entities ordered by a column
 */
export const listAllEntities =
  <T>(table: PgTable, orderByColumn: PgColumn, repoName: string) =>
  async (): Promise<readonly T[]> => {
    const logger = createRepoLogger(repoName)
    try {
      const rows = await db.select().from(table).orderBy(buildOrderBy(orderByColumn))
      logger.debug({ count: rows.length }, `${repoName}.listAll`)
      return rows as readonly T[]
    } catch (error) {
      logger.error({ error }, `${repoName}.listAll failed`)
      throw error
    }
  }

/**
 * Pure function to list entities filtered by a single column value
 */
export const listByColumn =
  <T, TValue>(
    table: PgTable,
    filterColumn: PgColumn,
    orderByColumn: PgColumn,
    repoName: string,
    direction: 'asc' | 'desc' = 'asc',
    operationName = 'listByColumn',
  ) =>
  async (value: TValue): Promise<readonly T[]> => {
    const logger = createRepoLogger(repoName)
    try {
      const rows = await db
        .select()
        .from(table)
        .where(eq(filterColumn, value as never))
        .orderBy(buildOrderBy(orderByColumn, direction))
      logger.debug({ value, count: rows.length }, `${repoName}.${operationName}`)
      return rows as readonly T[]
    } catch (error) {
      logger.error({ error, value }, `${repoName}.${operationName} failed`)
      throw error
    }
  }

/**
 * Pure function to list entities where a column value is in a list
 */
export const listByColumnInArray =
  <T, TValue>(
    table: PgTable,
    filterColumn: PgColumn,
    orderByColumn: PgColumn,
    repoName: string,
    direction: 'asc' | 'desc' = 'asc',
    operationName = 'listByColumnInArray',
  ) =>
  async (values: readonly TValue[]): Promise<readonly T[]> => {
    if (values.length === 0) return []

    const logger = createRepoLogger(repoName)
    try {
      const rows = await db
        .select()
        .from(table)
        .where(inArray(filterColumn, [...values] as never[]))
        .orderBy(buildOrderBy(orderByColumn, direction))
      logger.debug(
        { valuesCount: values.length, count: rows.length },
        `${repoName}.${operationName}`,
      )
      return rows as readonly T[]
    } catch (error) {
      logger.error({ error, valuesCount: values.length }, `${repoName}.${operationName} failed`)
      throw error
    }
  }

/**
 * Creates filter conditions from a record of filters
 * Functional approach for building WHERE clauses
 */
export const buildFilterConditions = <T extends Record<string, unknown>>(
  table: PgTable,
  filters: Partial<T>,
): SQL[] => {
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const column = (table as unknown as Record<string, PgColumn>)[key]
      if (!column) {
        throw new Error(`Column ${key} not found in table`)
      }

      if (Array.isArray(value)) {
        return inArray(column, value)
      }

      return eq(column, value)
    })
}

/**
 * Combines multiple filter conditions with AND
 * Pure functional composition
 */
export const combineWithAnd = (conditions: SQL[]): SQL | undefined => {
  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]
  return and(...conditions)
}

/**
 * Combines multiple filter conditions with OR
 * Pure functional composition
 */
export const combineWithOr = (conditions: SQL[]): SQL | undefined => {
  if (conditions.length === 0) return undefined
  if (conditions.length === 1) return conditions[0]
  return or(...conditions)
}

/**
 * Creates order by clause for sorting
 * Functional approach for building ORDER BY
 */
export const buildOrderBy = (column: PgColumn, direction: 'asc' | 'desc' = 'asc'): SQL => {
  return direction === 'asc' ? asc(column) : desc(column)
}

/**
 * Helper to safely get a column from a table
 */
export const getTableColumn = <T extends PgTable>(table: T, columnName: string): PgColumn => {
  const column = (table as unknown as Record<string, PgColumn>)[columnName]
  if (!column) {
    throw new Error(`Column ${columnName} not found in table`)
  }
  return column
}
