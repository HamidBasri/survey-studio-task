import { hashPassword } from '@/lib/auth/hash'
import type { SurveyConfig } from '@/lib/config/survey'
import { USER_ROLE } from '@/lib/config/user'
import { inArray } from 'drizzle-orm'
import { db } from './index'
import { response } from './schema/response'
import { survey } from './schema/survey'
import { surveyAssignment } from './schema/surveyAssignment'
import { user } from './schema/user'

async function main() {
  console.log('Seeding… (safe replace mode)')

  //
  // ──────────────────────────────────────────
  // TARGET RECORDS (to replace)
  // ──────────────────────────────────────────
  //

  const adminEmail = 'admin@example.com'
  const userEmail = 'user@example.com'

  const surveyTitles = ['Public Feedback Survey', 'Admin Internal Survey', 'User Support Survey']

  //
  // ──────────────────────────────────────────
  // DELETE EXISTING SEED DATA ONLY
  // ──────────────────────────────────────────
  //

  // Find surveys IDs we will replace
  const existingSurveys = await db.select().from(survey).where(inArray(survey.title, surveyTitles))

  const surveyIds = existingSurveys.map((s) => s.id)

  // Remove related responses
  if (surveyIds.length > 0) {
    await db.delete(response).where(inArray(response.surveyId, surveyIds))
    await db.delete(surveyAssignment).where(inArray(surveyAssignment.surveyId, surveyIds))
    await db.delete(survey).where(inArray(survey.title, surveyTitles))
  }

  // Remove the admin and user IF they exist
  await db.delete(user).where(inArray(user.email, [adminEmail, userEmail]))

  //
  // ──────────────────────────────────────────
  // INSERT USERS
  // ──────────────────────────────────────────
  //

  const adminPasswordHash = await hashPassword('admin123456')
  const userPasswordHash = await hashPassword('user123456')

  const [admin] = await db
    .insert(user)
    .values({
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: USER_ROLE.ADMIN,
    })
    .returning()

  const [regularUser] = await db
    .insert(user)
    .values({
      email: userEmail,
      passwordHash: userPasswordHash,
      role: USER_ROLE.USER,
    })
    .returning()

  //
  // ──────────────────────────────────────────
  // PUBLIC SURVEY
  // ──────────────────────────────────────────
  //

  const publicSurveyConfig: SurveyConfig = {
    title: 'Public Feedback Survey',
    questions: [
      { type: 'text', label: 'Your name?', name: 'name' },
      { type: 'rating', label: 'Rate our platform', name: 'rating', scale: 5 },
    ],
  }

  const [publicSurvey] = await db
    .insert(survey)
    .values({
      title: publicSurveyConfig.title,
      config: publicSurveyConfig,
      visibility: 'public',
      creatorId: admin.id,
    })
    .returning()

  //
  // ──────────────────────────────────────────
  // PRIVATE SURVEY (Admin only)
  // ──────────────────────────────────────────
  //

  const adminPrivateConfig: SurveyConfig = {
    title: 'Admin Internal Survey',
    questions: [
      { type: 'text', label: 'Admin note?', name: 'note' },
      { type: 'yes_no', label: 'Is the system stable?', name: 'stable' },
    ],
  }

  const [adminPrivateSurvey] = await db
    .insert(survey)
    .values({
      title: adminPrivateConfig.title,
      config: adminPrivateConfig,
      visibility: 'private',
      creatorId: admin.id,
    })
    .returning()

  await db.insert(surveyAssignment).values({
    surveyId: adminPrivateSurvey.id,
    userId: admin.id,
  })

  //
  // ──────────────────────────────────────────
  // PRIVATE SURVEY (User only)
  // ──────────────────────────────────────────
  //

  const userPrivateConfig: SurveyConfig = {
    title: 'User Support Survey',
    questions: [
      { type: 'text', label: 'Describe any issues', name: 'issues' },
      { type: 'rating', label: 'Rate support', name: 'support', scale: 5 },
    ],
  }

  const [userPrivateSurvey] = await db
    .insert(survey)
    .values({
      title: userPrivateConfig.title,
      config: userPrivateConfig,
      visibility: 'private',
      creatorId: admin.id,
    })
    .returning()

  await db.insert(surveyAssignment).values({
    surveyId: userPrivateSurvey.id,
    userId: regularUser.id,
  })

  //
  // ──────────────────────────────────────────
  // DONE
  // ──────────────────────────────────────────
  //

  console.log('Seed complete. Only seed data replaced.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
