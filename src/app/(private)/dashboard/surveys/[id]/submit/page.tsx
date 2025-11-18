'use client'

import type { SurveyFormValues } from '@/components/survey/dynamic-survey-form'
import { DynamicSurveyForm } from '@/components/survey/dynamic-survey-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubmitResponse, useUserSurveys } from '@/lib/hooks/use-user-surveys'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function SurveySubmitPage() {
  const params = useParams()
  const surveyId = params.id as string

  const { data: surveys, isLoading } = useUserSurveys()
  const submitResponse = useSubmitResponse()
  const [isSuccess, setIsSuccess] = useState(false)

  const survey = surveys?.find((s) => s.id === surveyId)

  const handleSubmit = async (data: SurveyFormValues) => {
    try {
      await submitResponse.mutateAsync({
        surveyId,
        answers: data,
      })
      setIsSuccess(true)
    } catch (error) {
      console.error('Failed to submit response:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Skeleton className="mb-8 h-10 w-3/4" />
        <Card>
          <CardContent className="space-y-6 p-8">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-600" />
            <h2 className="text-xl font-semibold text-red-900">Survey Not Found</h2>
            <p className="text-sm text-red-700">
              The survey you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to
              it.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (survey.isSubmitted) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-xl font-semibold text-green-900">Already Submitted</h2>
            <p className="text-sm text-green-700">
              You have already submitted a response to this survey
              {survey.submittedAt && <> on {new Date(survey.submittedAt).toLocaleDateString()}</>}.
            </p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-xl font-semibold text-green-900">Response Submitted!</h2>
            <p className="text-sm text-green-700">
              Thank you for completing the survey. Your response has been recorded.
            </p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-8">
          {submitResponse.isError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">
                  {submitResponse.error instanceof Error
                    ? submitResponse.error.message
                    : 'Failed to submit response. Please try again.'}
                </p>
              </div>
            </div>
          )}

          <DynamicSurveyForm
            config={survey.config}
            onSubmit={handleSubmit}
            isSubmitting={submitResponse.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
