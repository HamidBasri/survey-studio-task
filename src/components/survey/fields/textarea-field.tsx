'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import type { Question } from '@/lib/config/survey'
import type { ControllerRenderProps } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { SurveyFormValues } from '../dynamic-survey-form'

interface TextareaFieldProps {
  question: Question & { type: 'textarea' }
  readonly?: boolean
}

export function TextareaField({ question, readonly = false }: TextareaFieldProps) {
  const form = useFormContext<SurveyFormValues>()

  return (
    <FormField
      control={form.control}
      name={question.name}
      rules={{
        required: question.validation?.required ? `${question.label} is required` : false,
        minLength: question.validation?.minLength
          ? {
              value: question.validation.minLength,
              message: `Minimum length is ${question.validation.minLength}`,
            }
          : undefined,
        maxLength: question.validation?.maxLength
          ? {
              value: question.validation.maxLength,
              message: `Maximum length is ${question.validation.maxLength}`,
            }
          : undefined,
      }}
      render={({ field }: { field: ControllerRenderProps<SurveyFormValues, string> }) => (
        <FormItem>
          <FormLabel>
            {question.label}
            {question.validation?.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={`Enter ${question.label.toLowerCase()}`}
              className="resize-none"
              rows={4}
              {...field}
              value={(field.value as string) ?? ''}
              disabled={readonly}
              readOnly={readonly}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
