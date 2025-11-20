/**
 * Example Usage of Dynamic Survey Form
 *
 * This file demonstrates how to use the DynamicSurveyForm component
 * with various question types and conditional logic
 */

'use client'

import type { SurveyConfig } from '@/lib/config/survey'
import { useState } from 'react'
import { DynamicSurveyForm, type SurveyFormValues } from './dynamic-survey-form'

export function ExampleSurveyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Example survey configuration
  const surveyConfig: SurveyConfig = {
    title: 'Customer Satisfaction Survey',
    questions: [
      {
        name: 'fullName',
        label: 'Full Name',
        type: 'text',
        validation: {
          required: true,
          minLength: 2,
          maxLength: 100,
        },
      },
      {
        name: 'feedback',
        label: 'Your Feedback',
        type: 'textarea',
        validation: {
          required: true,
          minLength: 10,
        },
      },
      {
        name: 'satisfaction',
        label: 'How satisfied are you with our service?',
        type: 'rating',
        scale: 5,
        validation: {
          required: true,
        },
      },
      {
        name: 'recommendUs',
        label: 'Would you recommend us to others?',
        type: 'yes_no',
        validation: {
          required: true,
        },
      },
      {
        name: 'preferredContact',
        label: 'Preferred Contact Method',
        type: 'multiple_choice',
        options: ['Email', 'Phone', 'SMS', 'WhatsApp'],
        validation: {
          required: true,
        },
      },
      // Conditional question - only shows if user selected 'Email'
      {
        name: 'emailFrequency',
        label: 'How often would you like to receive emails?',
        type: 'multiple_choice',
        options: ['Daily', 'Weekly', 'Monthly', 'Never'],
        condition: {
          name: 'preferredContact',
          value: 'Email',
        },
      },
      {
        name: 'interests',
        label: 'What are you interested in?',
        type: 'multiple_select',
        options: ['Products', 'Services', 'Blog Posts', 'Events', 'Newsletters'],
        validation: {
          required: false,
        },
      },
    ],
  }

  // Handle form submission
  const handleSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true)

    try {
      console.log('Survey Response:', data)

      // Send data to API
      // const response = await fetch('/api/surveys/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // })

      // if (!response.ok) throw new Error('Submission failed')

      alert('Thank you for your feedback!')
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit survey. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <DynamicSurveyForm
        config={surveyConfig}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

/**
 * Example with default values (for editing existing responses)
 */
export function ExampleEditSurvey() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const surveyConfig: SurveyConfig = {
    title: 'Edit Your Response',
    questions: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        validation: { required: true },
      },
      {
        name: 'rating',
        label: 'Rating',
        type: 'rating',
        scale: 5,
      },
    ],
  }

  // Pre-populate with existing data
  const defaultValues = {
    name: 'John Doe',
    rating: 4,
  }

  const handleSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true)
    console.log('Updated data:', data)
    // Update logic here
    setIsSubmitting(false)
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <DynamicSurveyForm
        config={surveyConfig}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
