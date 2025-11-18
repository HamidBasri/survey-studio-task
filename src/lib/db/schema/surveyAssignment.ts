import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import type { ID } from '../types'
import { survey } from './survey'
import { user } from './user'

export const surveyAssignment = pgTable(
  'survey_assignment',
  {
    id: uuid('id').primaryKey().defaultRandom().$type<ID>(),
    surveyId: uuid('survey_id')
      .references(() => survey.id, { onDelete: 'cascade' })
      .notNull()
      .$type<ID>(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade' })
      .notNull()
      .$type<ID>(),
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  },
  (table) => [
    index('assign_survey_idx').on(table.surveyId),
    index('assign_user_idx').on(table.userId),
    uniqueIndex('assign_unique_survey_user_idx').on(table.surveyId, table.userId),
  ],
)
