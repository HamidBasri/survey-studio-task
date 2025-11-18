'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Question } from '@/lib/config/survey'
import type { ControllerRenderProps } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { SurveyFormValues } from '../dynamic-survey-form'

interface YesNoFieldProps {
  question: Question & { type: 'yes_no' }
  readonly?: boolean
}

export function YesNoField({ question, readonly = false }: YesNoFieldProps) {
  const form = useFormContext<SurveyFormValues>()

  return (
    <FormField
      control={form.control}
      name={question.name}
      rules={{
        required: question.validation?.required ? `${question.label} is required` : false,
      }}
      render={({ field }: { field: ControllerRenderProps<SurveyFormValues, string> }) => (
        <FormItem>
          <FormLabel>
            {question.label}
            {question.validation?.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={(field.value as string) || ''}
              className="flex space-x-6"
              disabled={readonly}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.name}-yes`} disabled={readonly} />
                <Label htmlFor={`${question.name}-yes`} className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.name}-no`} disabled={readonly} />
                <Label htmlFor={`${question.name}-no`} className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
