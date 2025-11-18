import { logger } from '../logger'
import { isOperationalError } from './error-handler'

export const setupGlobalErrorHandlers = () => {
  if (typeof process === 'undefined') {
    return
  }

  process.on('uncaughtException', (error: Error) => {
    logger.fatal({ err: error }, 'Uncaught exception')

    if (!isOperationalError(error)) {
      process.exit(1)
    }
  })

  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    logger.fatal({ err: error }, 'Unhandled promise rejection')

    if (!isOperationalError(error)) {
      process.exit(1)
    }
  })

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully')
    process.exit(0)
  })

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully')
    process.exit(0)
  })
}
