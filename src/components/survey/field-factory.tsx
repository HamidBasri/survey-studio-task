'use client'

import type { Question, QuestionType } from '@/lib/config/survey'
import type { ComponentType } from 'react'
import {
  MultipleChoiceField,
  MultipleSelectField,
  MultipleSelectWithOtherField,
  RatingField,
  TextField,
  TextareaField,
  YesNoField,
} from './fields'

/**
 * Field component type definition
 * We keep this generic on the full Question union to avoid
 * over-constraining individual field props per type.
 */
type FieldComponent = ComponentType<{ question: Question; readonly?: boolean }>

/**
 * Field registry mapping question types to their corresponding components
 * Uses the Registry Pattern for extensibility
 */
const fieldRegistry: Record<QuestionType, FieldComponent> = {
  text: TextField as FieldComponent,
  textarea: TextareaField as FieldComponent,
  multiple_choice: MultipleChoiceField as FieldComponent,
  multiple_select: MultipleSelectField as FieldComponent,
  multiple_select_with_other: MultipleSelectWithOtherField as FieldComponent,
  rating: RatingField as FieldComponent,
  yes_no: YesNoField as FieldComponent,
}

/**
 * Field Factory
 * Creates field components based on question type using the Factory Pattern
 */
export class FieldFactory {
  /**
   * Register a custom field component for a question type
   * Allows extending the factory with new field types
   */
  static register<T extends QuestionType>(type: T, component: FieldComponent): void {
    fieldRegistry[type] = component
  }

  /**
   * Get the appropriate field component for a question type
   * @param type - Question type
   * @returns Field component or null if not found
   */
  static getField(type: QuestionType): FieldComponent | null {
    const component = fieldRegistry[type]
    if (!component) {
      console.error(`No field component registered for type: ${type}`)
      return null
    }
    return component
  }

  /**
   * Check if a field component is registered for a question type
   */
  static hasField(type: QuestionType): boolean {
    return type in fieldRegistry
  }

  /**
   * Get all registered field types
   */
  static getRegisteredTypes(): QuestionType[] {
    return Object.keys(fieldRegistry) as QuestionType[]
  }
}
