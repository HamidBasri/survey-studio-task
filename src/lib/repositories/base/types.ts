import type { ID } from '@/lib/db/types'
import type { PgTable } from 'drizzle-orm/pg-core'

/**
 * Base entity that all domain models should extend
 */
export type BaseEntity = {
  readonly id: ID
  readonly createdAt: Date
}

/**
 * Common query options for repository operations
 */
export type QueryOptions = {
  readonly limit?: number
  readonly offset?: number
}

/**
 * Sort direction for ordering results
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort options for ordering results
 */
export interface SortOptions<TEntity> {
  readonly field: keyof TEntity
  readonly direction: SortDirection
}

/**
 * Generic filter predicate type
 */
export interface FilterPredicate<TEntity> {
  (entity: TEntity): boolean
}

/**
 * Base repository interface defining common CRUD operations
 */
export interface IBaseRepository<TEntity extends BaseEntity> {
  readonly byId: (id: ID) => Promise<TEntity | null>
  readonly byIds: (ids: readonly ID[]) => Promise<readonly TEntity[]>
  readonly create: (data: Omit<TEntity, 'id' | 'createdAt'>) => Promise<TEntity>
  readonly update: (
    id: ID,
    data: Partial<Omit<TEntity, 'id' | 'createdAt'>>,
  ) => Promise<TEntity | null>
  readonly delete: (id: ID) => Promise<TEntity | null>
  readonly exists: (id: ID) => Promise<boolean>
  readonly listAll: (options?: QueryOptions) => Promise<readonly TEntity[]>
  readonly count: () => Promise<number>
}

/**
 * Repository configuration for creating instances
 */
export interface RepositoryConfig<TTable extends PgTable> {
  readonly table: TTable
  readonly name: string
}
