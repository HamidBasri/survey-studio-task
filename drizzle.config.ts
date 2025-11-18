import { env } from '@/lib/config/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DB_URL,
  },
  strict: true,
})
