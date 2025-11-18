'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import type { Question } from '@/lib/config/survey'
import type { ControllerRenderProps } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { SurveyFormValues } from '../dynamic-survey-form'

interface MultipleSelectFieldProps {
  question: Question & { type: 'multiple_select' }
  readonly?: boolean
}

export function MultipleSelectField({ question, readonly = false }: MultipleSelectFieldProps) {
  const form = useFormContext<SurveyFormValues>()

  const validateMinChoices = (value: unknown) => {
    const minChoices = question.validation?.minChoices
    if (!minChoices) return true

    const selectedCount = Array.isArray(value) ? value.length : 0
    if (selectedCount < minChoices) {
      return `Please select at least ${minChoices} option${minChoices > 1 ? 's' : ''}`
    }
    return true
  }

  const validateMaxChoices = (value: unknown) => {
    const maxChoices = question.validation?.maxChoices
    if (!maxChoices) return true

    const selectedCount = Array.isArray(value) ? value.length : 0
    if (selectedCount > maxChoices) {
      return `Please select at most ${maxChoices} option${maxChoices > 1 ? 's' : ''}`
    }
    return true
  }

  return (
    <FormField
      control={form.control}
      name={question.name}
      rules={{
        required: question.validation?.required ? `${question.label} is required` : false,
        validate: {
          minChoices: validateMinChoices,
          maxChoices: validateMaxChoices,
        },
      }}
      render={({ field }: { field: ControllerRenderProps<SurveyFormValues, string> }) => (
        <FormItem>
          <FormLabel>
            {question.label}
            {question.validation?.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="flex flex-col space-y-2">
              {question.options.map((option) => {
                const isChecked = Array.isArray(field.value) && field.value.includes(option)
                return (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.name}-${option}`}
                      checked={isChecked}
                      disabled={readonly}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        const currentValue = Array.isArray(field.value) ? field.value : []
                        const isSelected = checked === true
                        const newValue = isSelected
                          ? [...currentValue, option]
                          : currentValue.filter((value) => value !== option)
                        field.onChange(newValue)
                      }}
                    />
                    <Label
                      htmlFor={`${question.name}-${option}`}
                      className="font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                )
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
