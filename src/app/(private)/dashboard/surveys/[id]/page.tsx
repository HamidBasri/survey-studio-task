'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DynamicSurveyForm } from '@/components/survey/dynamic-survey-form'
import { Button } from '@/components/ui/button'
import type { SurveyConfig } from '@/lib/config/survey'
import type { ID, Json } from '@/lib/db/types'
import { Calendar, ClipboardList, Trash2, User } from 'lucide-react'
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
      <DashboardLayout
        header={<DashboardHeader title="Survey Responses" icon={ClipboardList} showBackButton />}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-blue-600" />
            <p className="mt-4 text-sm text-muted-foreground">Loading responses...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout
        header={<DashboardHeader title="Survey Responses" icon={ClipboardList} showBackButton />}
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/40">
          <p className="text-sm font-medium text-red-800 dark:text-red-100">
            Failed to load responses
          </p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return null
  }

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title={data.survey.title}
          subtitle={`${data.responses.length} ${data.responses.length === 1 ? 'response' : 'responses'}`}
          icon={ClipboardList}
          showBackButton
        />
      }
    >
      {/* Responses List */}
      {data.responses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card p-8 text-center sm:p-12">
          <p className="text-lg font-semibold text-foreground">No responses yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
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
    </DashboardLayout>
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors transition-shadow hover:border-blue-200 hover:shadow-md">
      {/* Response Header */}
      <div
        className="flex cursor-pointer flex-col gap-4 border-b border-border p-4 hover:bg-muted sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pb-4"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
              Response #{index + 1}
            </span>
          </div>
          {response.user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{response.user.email}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={(event) => {
                event.stopPropagation()
                void onDelete(response.id)
              }}
              disabled={isDeleting}
              className="w-full gap-2 sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Readonly Survey Form */}
      {isOpen && (
        <div className="p-4 pt-3 sm:p-6 sm:pt-4">
          <DynamicSurveyForm
            config={surveyConfig}
            defaultValues={response.answers}
            readonly={true}
          />
        </div>
      )}
    </div>
  )
}
