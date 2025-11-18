import { StatusCodes } from 'http-status-codes'

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    context?: Record<string, unknown>,
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    }
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, StatusCodes.BAD_REQUEST, true, context)
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, StatusCodes.UNAUTHORIZED, true, context)
  }
}

/**
 * Authorization error (403)
 */
export class AuthorisationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, unknown>) {
    super(message, StatusCodes.FORBIDDEN, true, context)
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, StatusCodes.NOT_FOUND, true, context)
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, StatusCodes.CONFLICT, true, context)
  }
}

/**
 * Internal server error (500)
 */
export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', context?: Record<string, unknown>) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false, context)
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false, context)
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, context?: Record<string, unknown>) {
    super(`External service error: ${service}`, StatusCodes.BAD_GATEWAY, true, context)
  }
}
