import { index, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { ID, Json } from '../types'
import { survey } from './survey'
import { user } from './user'

export const response = pgTable(
  'response',
  {
    id: uuid('id').primaryKey().defaultRandom().$type<ID>(),
    surveyId: uuid('survey_id')
      .references(() => survey.id)
      .notNull()
      .$type<ID>(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'set null' })
      .$type<ID | null>(),
    answers: jsonb('answers').$type<Record<string, Json>>().notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('response_survey_idx').on(table.surveyId),
    index('response_user_idx').on(table.userId),
    index('response_created_idx').on(table.createdAt),
  ],
)
