import { ZodError } from 'zod'
import { SurveyConfigSchema, type SurveyConfig } from './survey'

/**
 * Result type for survey config parsing
 */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

/**
 * Parse and validate a JSON string or object as a survey configuration
 * Uses Zod schema for validation with comprehensive error handling
 *
 * @param input - JSON string or plain object to parse
 * @returns ParseResult with typed data or error information
 */
export function parseSurveyConfig(input: string | unknown): ParseResult<SurveyConfig> {
  try {
    // Parse JSON string if needed
    const data = typeof input === 'string' ? JSON.parse(input) : input

    // Validate against schema
    const result = SurveyConfigSchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data }
    }

    // Format Zod validation errors
    const errorMessages = formatZodError(result.error)
    return {
      success: false,
      error: `Survey configuration validation failed: ${errorMessages}`,
      details: result.error.issues,
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `Invalid JSON: ${error.message}`,
      }
    }

    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Format Zod validation errors into a readable string
 */
function formatZodError(error: ZodError): string {
  return error.issues
    .map((err) => {
      const path = err.path.join('.')
      return `${path ? `${path}: ` : ''}${err.message}`
    })
    .join('; ')
}

/**
 * Validate a survey configuration object without parsing JSON
 * Useful when you already have a parsed object
 *
 * @param config - Survey configuration object to validate
 * @returns ParseResult with typed data or error information
 */
export function validateSurveyConfig(config: unknown): ParseResult<SurveyConfig> {
  const result = SurveyConfigSchema.safeParse(config)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errorMessages = formatZodError(result.error)
  return {
    success: false,
    error: `Survey configuration validation failed: ${errorMessages}`,
    details: result.error.issues,
  }
}

/**
 * Parse survey config with exception throwing
 * Useful when you want to handle errors with try/catch
 *
 * @param input - JSON string or plain object to parse
 * @returns Validated SurveyConfig
 * @throws Error if parsing or validation fails
 */
export function parseSurveyConfigOrThrow(input: string | unknown): SurveyConfig {
  const result = parseSurveyConfig(input)

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}
