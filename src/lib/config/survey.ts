import { z } from 'zod'

/* Question types */
export const QUESTION_TYPES = [
  'text',
  'textarea',
  'multiple_choice',
  'multiple_select',
  'multiple_select_with_other',
  'rating',
  'yes_no',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

/* Visibility types */
export const SURVEY_VISIBILITY = ['public', 'private'] as const
export type SurveyVisibility = (typeof SURVEY_VISIBILITY)[number]

/* Base question */
const BaseQuestion = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(QUESTION_TYPES),
  validation: z
    .object({
      required: z.boolean().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      minChoices: z.number().optional(),
      maxChoices: z.number().optional(),
    })
    .optional(),
  condition: z
    .object({
      name: z.string(),
      value: z.any(),
    })
    .optional(),
})

/* Discriminated union per question type */
export const QuestionSchema = z.discriminatedUnion('type', [
  BaseQuestion.extend({ type: z.literal('text') }),
  BaseQuestion.extend({ type: z.literal('textarea') }),
  BaseQuestion.extend({
    type: z.literal('multiple_choice'),
    options: z.array(z.string()).min(1),
  }),
  BaseQuestion.extend({
    type: z.literal('multiple_select'),
    options: z.array(z.string()).min(1),
  }),
  BaseQuestion.extend({
    type: z.literal('multiple_select_with_other'),
    options: z.array(z.string()).min(1),
  }),
  BaseQuestion.extend({
    type: z.literal('rating'),
    scale: z.number().min(1).max(10).default(5),
  }),
  BaseQuestion.extend({ type: z.literal('yes_no') }),
])

export type Question = z.infer<typeof QuestionSchema>

/* Full survey config */
export const SurveyConfigSchema = z.object({
  title: z.string(),
  questions: z.array(QuestionSchema),
})

export type SurveyConfig = z.infer<typeof SurveyConfigSchema>
