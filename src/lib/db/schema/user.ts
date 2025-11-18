import type { UserRole } from '@/lib/config/user'
import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import type { ID } from '../types'

export const user = pgTable(
  'user',
  {
    id: uuid('id').primaryKey().defaultRandom().$type<ID>(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('user').$type<UserRole>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('user_role_idx').on(table.role)],
)
