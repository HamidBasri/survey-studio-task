'use client'

import { DynamicSurveyForm } from '@/components/survey'
import type { SurveyConfig } from '@/lib/config/survey'
import { useState } from 'react'

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const surveyConfig: SurveyConfig = {
    title: 'Survey Demo – All Field Types',
    questions: [
      {
        name: 'fullName',
        label: 'Full name',
        type: 'text',
        validation: {
          required: true,
          minLength: 2,
          maxLength: 100,
        },
      },
      {
        name: 'aboutYou',
        label: 'Tell us about yourself',
        type: 'textarea',
        validation: {
          minLength: 10,
          maxLength: 500,
        },
      },
      {
        name: 'favouriteProduct',
        label: 'What is your favourite product?',
        type: 'multiple_choice',
        options: ['Product A', 'Product B', 'Product C', 'Other'],
        validation: {
          required: true,
        },
      },
      {
        name: 'interestedIn',
        label: 'What are you interested in?',
        type: 'multiple_select',
        options: ['Features', 'Pricing', 'Support', 'Integrations', 'Roadmap'],
      },
      {
        name: 'satisfaction',
        label: 'How satisfied are you overall?',
        type: 'rating',
        scale: 5,
        validation: {
          required: true,
        },
      },
      {
        name: 'wouldRecommend',
        label: 'Would you recommend us to a friend?',
        type: 'yes_no',
        validation: {
          required: true,
        },
      },
    ],
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      // Replace with real API call when needed
      console.log('Demo survey submission:', data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto max-w-2xl py-10">
      <DynamicSurveyForm
        config={surveyConfig}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </main>
  )
}
