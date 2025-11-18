import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { env } from '../config/env'
import { logger } from '../logger'
import { AppError, InternalError, ValidationError } from './app-error'

/**
 * Error response structure
 */
interface ErrorResponse {
  error: {
    message: string
    code: string
    statusCode: number
    details?: unknown
  }
}

/**
 * Handle Zod validation errors
 */
const handleZodError = (error: ZodError): ValidationError => {
  const details = error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return new ValidationError('Validation failed', { details })
}

/**
 * Determine if error is operational (expected) or programming error
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Format error for API response
 */
const formatErrorResponse = (error: AppError): ErrorResponse => {
  const isDevelopment = env.NODE_ENV === 'development'

  return {
    error: {
      message: error.message,
      code: error.name,
      statusCode: error.statusCode,
      ...(isDevelopment && error.context ? { details: error.context } : {}),
    },
  }
}

/**
 * Log error with appropriate level
 */
const logError = (error: Error, context?: Record<string, unknown>) => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
    ...(error instanceof AppError ? { statusCode: error.statusCode, context: error.context } : {}),
  }

  if (error instanceof AppError && error.isOperational) {
    logger.warn(errorInfo, 'Operational error occurred')
  } else {
    logger.error(errorInfo, 'Unexpected error occurred')
  }
}

/**
 * Central error handler for API routes
 * Converts errors to appropriate HTTP responses
 */
export const handleApiError = (error: unknown, context?: Record<string, unknown>): NextResponse => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = handleZodError(error)
    logError(validationError, context)
    return NextResponse.json(formatErrorResponse(validationError), {
      status: validationError.statusCode,
    })
  }

  // Handle known application errors
  if (error instanceof AppError) {
    logError(error, context)
    return NextResponse.json(formatErrorResponse(error), {
      status: error.statusCode,
    })
  }

  // Handle unknown errors
  const internalError = new InternalError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
  )

  logError(error instanceof Error ? error : new Error(String(error)), context)

  // Don't expose internal error details in production
  const response =
    env.NODE_ENV === 'production'
      ? new InternalError('An unexpected error occurred')
      : internalError

  return NextResponse.json(formatErrorResponse(response), {
    status: response.statusCode,
  })
}

/**
 * Async error wrapper for API route handlers
 * Automatically catches and handles errors
 */
export const asyncHandler = <T extends unknown[], R>(handler: (...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Global error handler for uncaught errors
 * Should be called in app initialization
 */
