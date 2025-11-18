'use client'

import { Button } from '@/components/ui/button'
import { parseSurveyConfig } from '@/lib/config/survey-parser'
import { useState } from 'react'
import type { SurveyFormValues } from './dynamic-survey-form'
import { DynamicSurveyForm } from './dynamic-survey-form'

/**
 * Example: Dynamic Form Builder from JSON
 * Demonstrates parsing JSON survey configuration and rendering a dynamic form
 */

const EXAMPLE_SURVEY_JSON = `{
  "title": "Customer Satisfaction Survey",
  "questions": [
    {
      "type": "text",
      "label": "What is your name?",
      "name": "name",
      "validation": { "required": true, "minLength": 3 }
    },
    {
      "type": "multiple_choice",
      "label": "How did you hear about us?",
      "name": "referral",
      "options": ["Friends", "Online Ad", "Social Media", "Other"],
      "validation": { "required": true }
    },
    {
      "type": "rating",
      "label": "Rate our service",
      "name": "rating",
      "scale": 5,
      "validation": { "required": true }
    },
    {
      "type": "multiple_select",
      "label": "What did you like about our service?",
      "name": "likes",
      "options": ["Fast", "Friendly", "Affordable", "Other"],
      "validation": { "required": true, "minChoices": 1 }
    },
    {
      "type": "yes_no",
      "label": "Would you recommend us to a friend?",
      "name": "recommend",
      "validation": { "required": true }
    },
    {
      "type": "textarea",
      "label": "Please specify why you would not recommend us.",
      "name": "not_recommend_reason",
      "validation": { "required": false },
      "condition": {
        "name": "recommend",
        "value": false
      }
    },
    {
      "type": "multiple_select_with_other",
      "label": "What can we do to improve our service?",
      "name": "improvements",
      "options": ["Faster response time", "More payment options", "Other"],
      "validation": { "required": true, "minChoices": 1 },
      "condition": {
        "name": "recommend",
        "value": false
      }
    },
    {
      "type": "textarea",
      "label": "Any additional feedback?",
      "name": "feedback"
    }
  ]
}`

export function ExampleJsonUsage() {
  const [jsonInput, setJsonInput] = useState(EXAMPLE_SURVEY_JSON)
  const [error, setError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<SurveyFormValues | null>(null)

  // Parse the JSON configuration
  const parseResult = parseSurveyConfig(jsonInput)

  const handleSubmit = (data: SurveyFormValues) => {
    console.log('Survey submitted:', data)
    setSubmittedData(data)
  }

  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    setError(null)
    setSubmittedData(null)
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8">
      {/* JSON Editor */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Survey Configuration (JSON)</h2>
        <textarea
          value={jsonInput}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm border rounded-lg"
          placeholder="Paste your survey JSON here..."
        />
        <Button
          onClick={() => {
            setJsonInput(EXAMPLE_SURVEY_JSON)
            setError(null)
            setSubmittedData(null)
          }}
          variant="outline"
        >
          Reset to Example
        </Button>
      </div>

      {/* Error Display */}
      {!parseResult.success && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <h3 className="font-semibold text-destructive mb-2">Configuration Error</h3>
          <p className="text-sm text-destructive">{parseResult.error}</p>
        </div>
      )}

      {/* Dynamic Form */}
      {parseResult.success && (
        <div className="space-y-4">
          <div className="border-t pt-6">
            <DynamicSurveyForm config={parseResult.data} onSubmit={handleSubmit} />
          </div>
        </div>
      )}

      {/* Submission Result */}
      {submittedData && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-500 rounded-lg">
          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
            Survey Submitted Successfully!
          </h3>
          <pre className="text-xs overflow-auto p-2 bg-white dark:bg-gray-900 rounded">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
