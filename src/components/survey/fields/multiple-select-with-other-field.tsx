'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Question } from '@/lib/config/survey'
import type { ControllerRenderProps } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { SurveyFormValues } from '../dynamic-survey-form'

interface MultipleSelectWithOtherFieldProps {
  question: Question & { type: 'multiple_select_with_other' }
  readonly?: boolean
}

interface FieldValue {
  selected: string[]
  otherText?: string
}

export function MultipleSelectWithOtherField({
  question,
  readonly = false,
}: MultipleSelectWithOtherFieldProps) {
  const form = useFormContext<SurveyFormValues>()

  const validateMinChoices = (value: FieldValue | undefined) => {
    const minChoices = question.validation?.minChoices
    if (!minChoices) return true

    const totalSelected = (value?.selected?.length || 0) + (value?.otherText ? 1 : 0)
    if (totalSelected < minChoices) {
      return `Please select at least ${minChoices} option${minChoices > 1 ? 's' : ''}`
    }
    return true
  }

  const validateMaxChoices = (value: FieldValue | undefined) => {
    const maxChoices = question.validation?.maxChoices
    if (!maxChoices) return true

    const totalSelected = (value?.selected?.length || 0) + (value?.otherText ? 1 : 0)
    if (totalSelected > maxChoices) {
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
          minChoices: validateMinChoices as (value: unknown) => string | true,
          maxChoices: validateMaxChoices as (value: unknown) => string | true,
        },
      }}
      render={({ field }: { field: ControllerRenderProps<SurveyFormValues, string> }) => {
        const fieldValue = (field.value as FieldValue) || { selected: [], otherText: '' }
        const hasOtherSelected = fieldValue.otherText && fieldValue.otherText.length > 0

        return (
          <FormItem>
            <FormLabel>
              {question.label}
              {question.validation?.required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <div className="flex flex-col space-y-2">
                {question.options.map((option) => {
                  const isChecked = fieldValue.selected?.includes(option) || false
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.name}-${option}`}
                        checked={isChecked}
                        disabled={readonly}
                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                          const currentSelected = fieldValue.selected || []
                          const isSelected = checked === true
                          const newSelected = isSelected
                            ? [...currentSelected, option]
                            : currentSelected.filter((value) => value !== option)
                          field.onChange({ ...fieldValue, selected: newSelected })
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

                {/* Other option with text input */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.name}-other-checkbox`}
                      checked={!!hasOtherSelected}
                      disabled={readonly}
                      onCheckedChange={(checked: boolean | 'indeterminate') => {
                        if (checked === true) {
                          field.onChange({ ...fieldValue, otherText: '' })
                        } else {
                          field.onChange({ ...fieldValue, otherText: undefined })
                        }
                      }}
                    />
                    <Label
                      htmlFor={`${question.name}-other-checkbox`}
                      className="font-normal cursor-pointer"
                    >
                      Other
                    </Label>
                  </div>
                  {fieldValue.otherText !== undefined && (
                    <Input
                      id={`${question.name}-other-input`}
                      placeholder="Please specify..."
                      value={fieldValue.otherText || ''}
                      disabled={readonly}
                      readOnly={readonly}
                      onChange={(e) => {
                        field.onChange({ ...fieldValue, otherText: e.target.value })
                      }}
                      className="ml-6"
                    />
                  )}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
