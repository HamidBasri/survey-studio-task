import { type UserRole } from '@/lib/config/user'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema/user'
import { eq } from 'drizzle-orm'

export const userRepo = {
  async byEmail(email: string) {
    const rows = await db.select().from(user).where(eq(user.email, email)).limit(1)
    return rows[0] ?? null
  },

  async create(email: string, passwordHash: string, role: UserRole = 'user') {
    const [createdUser] = await db.insert(user).values({ email, passwordHash, role }).returning()

    return createdUser
  },
}
