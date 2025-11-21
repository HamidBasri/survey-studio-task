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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-blue-600" />
          <p className="mt-4 text-sm text-muted-foreground">Loading surveys...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/40">
        <p className="text-sm font-medium text-red-800 dark:text-red-100">Failed to load surveys</p>
        <p className="mt-1 text-xs text-red-600 dark:text-red-300">{error.message}</p>
      </div>
    )
  }

  if (!surveys || surveys.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No surveys yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first survey.
        </p>
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
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-card-foreground line-clamp-2">
              {survey.title}
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {survey.responseCount} {survey.responseCount === 1 ? 'response' : 'responses'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div title="Private">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
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
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background/80 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              title="View JSON Configuration"
            >
              <Code className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/60"
              title="Delete Survey"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            {userSurvey && !userSurvey.isSubmitted && (
              <Link
                href={`/dashboard/surveys/${survey.id}/submit`}
                className="flex flex-1 items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950"
              >
                Submit
              </Link>
            )}
            <Link
              href={`/dashboard/surveys/${survey.id}`}
              className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-blue-950"
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
