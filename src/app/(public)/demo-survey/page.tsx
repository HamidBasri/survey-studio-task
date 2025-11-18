'use client'

import type { SurveyFormValues } from '@/components/survey/dynamic-survey-form'
import { DynamicSurveyForm } from '@/components/survey/dynamic-survey-form'
import type { SurveyConfig } from '@/lib/config/survey'
import { useState } from 'react'

/**
 * Demo Survey Page
 * Showcases all available field types with validation and conditional logic
 */

const DEMO_SURVEY_CONFIG: SurveyConfig = {
  title: 'Complete Survey Demo - All Field Types',
  questions: [
    // 1. Text Field
    {
      type: 'text',
      label: 'What is your full name?',
      name: 'fullName',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 50,
      },
    },
    // 2. Text Field (Email)
    {
      type: 'text',
      label: 'What is your email address?',
      name: 'email',
      validation: {
        required: true,
        minLength: 5,
      },
    },
    // 3. Multiple Choice
    {
      type: 'multiple_choice',
      label: 'How did you hear about us?',
      name: 'referralSource',
      options: ['Google Search', 'Social Media', 'Friend Referral', 'Advertisement', 'Other'],
      validation: {
        required: true,
      },
    },
    // 4. Rating Field
    {
      type: 'rating',
      label: 'How would you rate your overall experience?',
      name: 'overallRating',
      scale: 5,
      validation: {
        required: true,
      },
    },
    // 5. Yes/No Field
    {
      type: 'yes_no',
      label: 'Would you recommend our service to others?',
      name: 'wouldRecommend',
      validation: {
        required: true,
      },
    },
    // 6. Conditional Textarea (shows if wouldRecommend is false)
    {
      type: 'textarea',
      label: 'What are the main reasons you would not recommend us?',
      name: 'notRecommendReasons',
      validation: {
        required: true,
        minLength: 10,
      },
      condition: {
        name: 'wouldRecommend',
        value: false,
      },
    },
    // 7. Multiple Select
    {
      type: 'multiple_select',
      label: 'What features do you use most? (Select at least 2)',
      name: 'usedFeatures',
      options: [
        'Dashboard',
        'Reports',
        'Analytics',
        'Notifications',
        'Mobile App',
        'API Integration',
      ],
      validation: {
        required: true,
        minChoices: 2,
        maxChoices: 4,
      },
    },
    // 8. Conditional Multiple Select with Other (shows if wouldRecommend is false)
    {
      type: 'multiple_select_with_other',
      label: 'What improvements would you like to see? (Select at least 1)',
      name: 'suggestedImprovements',
      options: [
        'Better Performance',
        'More Features',
        'Improved UI/UX',
        'Better Documentation',
        'Lower Pricing',
      ],
      validation: {
        required: true,
        minChoices: 1,
      },
      condition: {
        name: 'wouldRecommend',
        value: false,
      },
    },
    // 9. Rating Field (conditional - shows if wouldRecommend is true)
    {
      type: 'rating',
      label: 'How likely are you to recommend us? (1-10)',
      name: 'npsScore',
      scale: 10,
      validation: {
        required: true,
      },
      condition: {
        name: 'wouldRecommend',
        value: true,
      },
    },
    // 10. Multiple Select with Other
    {
      type: 'multiple_select_with_other',
      label: 'Which communication channels do you prefer? (Select any)',
      name: 'preferredChannels',
      options: ['Email', 'SMS', 'Push Notifications', 'Phone Call'],
      validation: {
        required: false,
        minChoices: 1,
      },
    },
    // 11. Textarea for additional feedback
    {
      type: 'textarea',
      label: 'Any additional comments or suggestions?',
      name: 'additionalFeedback',
      validation: {
        required: false,
        maxLength: 500,
      },
    },
  ],
}

export default function DemoSurveyPage() {
  const [submittedData, setSubmittedData] = useState<SurveyFormValues | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Survey submitted:', data)
    setSubmittedData(data)
    setIsSubmitting(false)

    // Scroll to result
    setTimeout(() => {
      document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-3xl py-12 px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Survey Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Experience all 7 field types with validation and conditional logic
          </p>
        </div>

        {/* Info Card */}
        <div className="mb-8 p-6 bg-card border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-3">✨ Demo Features</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong>Text Fields</strong> - Name and email with min/max length validation
            </li>
            <li>
              • <strong>Multiple Choice</strong> - Radio button selection
            </li>
            <li>
              • <strong>Rating</strong> - 5-star and 10-point scales
            </li>
            <li>
              • <strong>Yes/No</strong> - Boolean choices with conditional fields
            </li>
            <li>
              • <strong>Multiple Select</strong> - Checkbox selections with min/max choices
            </li>
            <li>
              • <strong>Multiple Select with Other</strong> - Includes custom text input
            </li>
            <li>
              • <strong>Textarea</strong> - Long-form text responses
            </li>
            <li>
              • <strong>Conditional Logic</strong> - Questions appear based on previous answers
            </li>
          </ul>
        </div>

        {/* Survey Form */}
        <div className="bg-card border rounded-lg shadow-lg p-8 mb-8">
          <DynamicSurveyForm
            config={DEMO_SURVEY_CONFIG}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Submission Result */}
        {submittedData && (
          <div id="result" className="bg-card border border-green-500 rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  Survey Submitted Successfully!
                </h3>
                <p className="text-muted-foreground">Thank you for your feedback</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-lg">Submitted Data:</h4>
              <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono">{JSON.stringify(submittedData, null, 2)}</pre>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedData(null)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Submit Another Response
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Built with React Hook Form, Zod validation, and TypeScript</p>
        </div>
      </div>
    </div>
  )
}
