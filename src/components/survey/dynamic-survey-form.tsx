'use client'

import { Button } from '@/components/ui/button'
import type { Question, SurveyConfig } from '@/lib/config/survey'
import { getVisibleQuestions } from '@/lib/survey/condition-evaluator'
import { useCallback } from 'react'
import { FormProvider, type UseFormReturn, useForm, useWatch } from 'react-hook-form'
import { FieldFactory } from './field-factory'

export type SurveyFormValues = Record<string, unknown>

interface DynamicSurveyFormProps {
  config: SurveyConfig
  onSubmit?: (data: SurveyFormValues) => void | Promise<void>
  defaultValues?: SurveyFormValues
  isSubmitting?: boolean
  readonly?: boolean
}

/**
 * Dynamic Survey Form Component
 * Renders form fields dynamically based on survey configuration
 * Uses Factory Pattern to create appropriate field components
 */
export function DynamicSurveyForm({
  config,
  onSubmit,
  defaultValues = {},
  isSubmitting = false,
  readonly = false,
}: DynamicSurveyFormProps) {
  const form: UseFormReturn<SurveyFormValues> = useForm<SurveyFormValues>({
    defaultValues,
    mode: 'onBlur',
  })

  const formValues = useWatch({ control: form.control })

  const visibleQuestions = getVisibleQuestions(config.questions, formValues)

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (data: SurveyFormValues) => {
      if (!onSubmit) return
      try {
        await onSubmit(data)
      } catch (error) {
        console.error('Form submission failed:', error)
      }
    },
    [onSubmit],
  )

  /**
   * Render a single field based on question configuration
   */
  const renderField = useCallback(
    (question: Question) => {
      const FieldComponent = FieldFactory.getField(question.type)

      if (!FieldComponent) {
        console.warn(`Unknown field type: ${question.type}`)
        return null
      }

      return (
        <div key={question.name} className="space-y-2">
          <FieldComponent question={question} readonly={readonly} />
        </div>
      )
    },
    [readonly],
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Survey Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">{config.title}</h2>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-6">{visibleQuestions.map((question) => renderField(question))}</div>

        {/* Submit Button */}
        {!readonly && (
          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  )
}
