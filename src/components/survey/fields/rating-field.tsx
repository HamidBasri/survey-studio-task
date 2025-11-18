'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Question } from '@/lib/config/survey'
import type { ControllerRenderProps } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { SurveyFormValues } from '../dynamic-survey-form'

interface RatingFieldProps {
  question: Question & { type: 'rating' }
  readonly?: boolean
}

export function RatingField({ question, readonly = false }: RatingFieldProps) {
  const form = useFormContext<SurveyFormValues>()
  const scale = question.scale || 5
  const ratings = Array.from({ length: scale }, (_, i) => i + 1)

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
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value?.toString()}
              className="flex space-x-3"
              disabled={readonly}
            >
              {ratings.map((rating) => (
                <div key={rating} className="flex flex-col items-center space-y-1">
                  <RadioGroupItem
                    value={rating.toString()}
                    id={`${question.name}-${rating}`}
                    disabled={readonly}
                  />
                  <Label
                    htmlFor={`${question.name}-${rating}`}
                    className="font-normal cursor-pointer text-sm"
                  >
                    {rating}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
