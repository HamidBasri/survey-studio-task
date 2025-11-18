import type { SurveyConfig, SurveyVisibility } from '@/lib/config/survey'
import { index, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import type { ID } from '../types'
import { user } from './user'

export const survey = pgTable(
  'survey',
  {
    id: uuid('id').primaryKey().defaultRandom().$type<ID>(),
    title: varchar('title', { length: 255 }).notNull(),
    config: jsonb('config').$type<SurveyConfig>().notNull(),
    visibility: varchar('visibility', { length: 20 })
      .notNull()
      .default('private')
      .$type<SurveyVisibility>(),
    creatorId: uuid('creator_id')
      .references(() => user.id)
      .notNull()
      .$type<ID>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('survey_title_idx').on(table.title),
    index('survey_visibility_idx').on(table.visibility),
    index('survey_creator_idx').on(table.creatorId),
  ],
)
