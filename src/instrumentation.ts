/**
 * Instrumentation file for Next.js
 * This runs once when the server starts
 * Used to set up global error handlers and logging
 */

import { env } from './lib/config/env'

export async function register() {
  if (env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('./lib/logger')

    logger.info(
      {
        runtime: env.NEXT_RUNTIME,
        nodeEnv: env.NODE_ENV,
      },
      'Application instrumentation initialised',
    )
  }
}
