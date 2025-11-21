'use client'

import { useDeleteSurvey, useSurveys, type Survey } from '@/lib/hooks/use-surveys'
import { useUserSurveys, type UserSurvey } from '@/lib/hooks/use-user-surveys'
import { Code, FileText, Globe, Lock, Trash2, UserCheck, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DeleteSurveyDialog } from './delete-survey-dialog'
import { JsonViewerDialog } from './json-viewer-dialog'

export function SurveyGrid() {
  const { data: surveys, isLoading, error } = useSurveys()
  const { data: userSurveys } = useUserSurveys()

  const userSurveyMap = new Map<string, UserSurvey>(userSurveys?.map((s) => [s.id, s]) ?? [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Loading surveys...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">Failed to load surveys</p>
        <p className="mt-1 text-xs text-red-600">{error.message}</p>
      </div>
    )
  }

  if (!surveys || surveys.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No surveys yet</h3>
        <p className="mt-2 text-sm text-gray-600">Get started by creating your first survey.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {surveys.map((survey) => (
        <SurveyCard key={survey.id} survey={survey} userSurvey={userSurveyMap.get(survey.id)} />
      ))}
    </div>
  )
}

function SurveyCard({ survey, userSurvey }: { survey: Survey; userSurvey?: UserSurvey }) {
  const [showJsonViewer, setShowJsonViewer] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteSurvey = useDeleteSurvey()
  const questionCount = survey.config.questions.length

  const handleDelete = async () => {
    await deleteSurvey.mutateAsync(survey.id)
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{survey.title}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {survey.responseCount} {survey.responseCount === 1 ? 'response' : 'responses'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCheck className="h-4 w-4" />
                <span>
                  {survey.assignedUserCount} {survey.assignedUserCount === 1 ? 'user' : 'users'}{' '}
                  {survey.visibility === 'public' ? 'can access' : 'assigned'}
                </span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            {survey.visibility === 'public' ? (
              <div title="Public">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
            ) : (
              <div title="Private">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            {new Date(survey.createdAt).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonViewer(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              title="View JSON Configuration"
            >
              <Code className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              title="Delete Survey"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            {userSurvey && !userSurvey.isSubmitted && (
              <Link
                href={`/dashboard/surveys/${survey.id}/submit`}
                className="flex flex-1 items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Submit
              </Link>
            )}
            <Link
              href={`/dashboard/surveys/${survey.id}`}
              className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View
            </Link>
          </div>
        </div>
      </div>

      <JsonViewerDialog
        isOpen={showJsonViewer}
        onClose={() => setShowJsonViewer(false)}
        config={survey.config}
        title={survey.title}
      />

      <DeleteSurveyDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        surveyTitle={survey.title}
        responseCount={survey.responseCount}
      />
    </>
  )
}
