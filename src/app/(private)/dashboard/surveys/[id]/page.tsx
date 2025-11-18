'use client'

import { DynamicSurveyForm } from '@/components/survey/dynamic-survey-form'
import { Button } from '@/components/ui/button'
import type { SurveyConfig } from '@/lib/config/survey'
import type { ID, Json } from '@/lib/db/types'
import { ArrowLeft, Calendar, Trash2, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type SurveyResponse = {
  id: ID
  answers: Record<string, Json>
  createdAt: string
  user: {
    id: ID
    email: string
  } | null
}

type SurveyResponsesData = {
  survey: {
    id: ID
    title: string
    config: SurveyConfig
  }
  responses: SurveyResponse[]
}

export default function SurveyResponsesPage() {
  const params = useParams()
  const surveyId = params.id as string

  const [data, setData] = useState<SurveyResponsesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<ID | null>(null)

  useEffect(() => {
    async function fetchResponses() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/surveys/${surveyId}/responses`)

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Failed to fetch responses' }))
          throw new Error(errorData.message || 'Failed to fetch responses')
        }

        const responseData = await response.json()
        setData(responseData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [surveyId])

  const handleDelete = async (responseId: ID) => {
    if (!confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(responseId)
      const response = await fetch(`/api/surveys/${surveyId}/responses/${responseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to delete response' }))
        throw new Error(errorData.message || 'Failed to delete response')
      }

      // Remove the deleted response from the state
      setData((prevData) => {
        if (!prevData) return prevData
        return {
          ...prevData,
          responses: prevData.responses.filter((r) => r.id !== responseId),
        }
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting the response')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200/60 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              <p className="mt-4 text-sm text-gray-600">Loading responses...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200/60 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800">Failed to load responses</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200/60 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              {data.survey.title}
            </h1>
            <p className="text-sm text-gray-500">
              {data.responses.length} {data.responses.length === 1 ? 'response' : 'responses'}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Responses List */}
        {data.responses.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center sm:p-12">
            <p className="text-lg font-semibold text-gray-900">No responses yet</p>
            <p className="mt-2 text-sm text-gray-600">
              Responses will appear here once users submit the survey.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.responses.map((response, index) => (
              <ResponseCard
                key={response.id}
                response={response}
                index={index}
                surveyConfig={data.survey.config}
                onDelete={handleDelete}
                isDeleting={deletingId === response.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

interface ResponseCardProps {
  response: SurveyResponse
  index: number
  surveyConfig: SurveyConfig
  onDelete: (responseId: ID) => Promise<void>
  isDeleting: boolean
}

function ResponseCard({ response, index, surveyConfig, onDelete, isDeleting }: ResponseCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Response Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              Response #{index + 1}
            </span>
          </div>
          {response.user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{response.user.email}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">
              {new Date(response.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(response.id)}
            disabled={isDeleting}
            className="w-full gap-2 sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Readonly Survey Form */}
      <div className="p-4 pt-3 sm:p-6 sm:pt-4">
        <DynamicSurveyForm config={surveyConfig} defaultValues={response.answers} readonly={true} />
      </div>
    </div>
  )
}
