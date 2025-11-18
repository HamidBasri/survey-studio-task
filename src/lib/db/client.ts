import { env } from '@/lib/config/env'
import postgres from 'postgres'

export const client = postgres(env.DB_URL, {
  max: 10,
  idle_timeout: 20,
})
