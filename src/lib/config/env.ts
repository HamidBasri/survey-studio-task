import * as z from 'zod'

const EnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().optional(),
  DB_NAME: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
  NEXT_RUNTIME: z.string().optional(),
  AUTH_SECRET: z.string('AUTH_SECRET is required'),
})

const raw = EnvSchema.parse(process.env)

// Use DATABASE_URL if provided (Docker), otherwise construct from individual vars (local dev)
const dbUrl =
  raw.DATABASE_URL ||
  `postgresql://${raw.DB_USER}:${raw.DB_PASSWORD}@${raw.DB_HOST}:${raw.DB_PORT}/${raw.DB_NAME}`

export const env = {
  ...raw,
  DB_URL: dbUrl,
}
