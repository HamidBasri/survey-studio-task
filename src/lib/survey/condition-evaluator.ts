/**
 * Condition Evaluator Utility
 * Evaluates conditional field visibility based on form values
 * Handles multiple data types: boolean, string, number, arrays
 */

import type { SurveyFormValues } from '@/components/survey/dynamic-survey-form'
import type { Question } from '@/lib/config/survey'

/**
 * Normalises boolean values from different representations
 * Converts "yes"/"no", true/false, "true"/"false", 1/0 to boolean
 */
function normaliseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase()
    if (lowerValue === 'yes' || lowerValue === 'true') return true
    if (lowerValue === 'no' || lowerValue === 'false') return false
  }

  if (typeof value === 'number') {
    if (value === 1) return true
    if (value === 0) return false
  }

  return null
}

/**
 * Compares two values considering type coercion
 * Handles boolean, string, number, and array comparisons
 */
function valuesMatch(actualValue: unknown, expectedValue: unknown): boolean {
  // Handle undefined/null cases
  if (actualValue === undefined || actualValue === null) {
    return false
  }

  // Try boolean comparison first
  const actualBool = normaliseBoolean(actualValue)
  const expectedBool = normaliseBoolean(expectedValue)

  if (actualBool !== null && expectedBool !== null) {
    return actualBool === expectedBool
  }

  // Handle array comparisons (for multiple select fields)
  if (Array.isArray(actualValue)) {
    if (Array.isArray(expectedValue)) {
      // Check if arrays have any overlap
      return expectedValue.some((val) => actualValue.includes(val))
    }
    // Check if array contains the expected value
    return actualValue.includes(expectedValue)
  }

  // Direct equality comparison
  return actualValue === expectedValue
}

/**
 * Evaluates whether a question should be visible based on its condition
 * @param question - The question with potential condition
 * @param formValues - Current form values
 * @returns true if the question should be visible, false otherwise
 */
export function evaluateCondition(question: Question, formValues: SurveyFormValues): boolean {
  // No condition means always visible
  if (!question.condition) {
    return true
  }

  const { name, value: expectedValue } = question.condition

  // Get the actual value from form
  const actualValue = formValues[name]

  // Evaluate the condition
  return valuesMatch(actualValue, expectedValue)
}

/**
 * Filters questions based on their visibility conditions
 * @param questions - Array of questions to filter
 * @param formValues - Current form values
 * @returns Array of visible questions
 */
export function getVisibleQuestions(
  questions: Question[],
  formValues: SurveyFormValues,
): Question[] {
  return questions.filter((question) => evaluateCondition(question, formValues))
}
