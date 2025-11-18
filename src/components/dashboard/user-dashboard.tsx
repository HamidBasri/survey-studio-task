'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserSurveys } from '@/lib/hooks/use-user-surveys'
import { AlertCircle, CheckCircle2, FileText, Globe, Inbox, Lock } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

export function UserDashboard() {
  const { data: surveys, isLoading, error } = useUserSurveys()

  const stats = useMemo(() => {
    if (!surveys) return { completed: 0, pending: 0, rate: 'N/A' }

    const completed = surveys.filter((s) => s.isSubmitted).length
    const total = surveys.length
    const pending = total - completed
    const rate = total > 0 ? `${Math.round((completed / total) * 100)}%` : 'N/A'

    return { completed, pending, rate }
  }, [surveys])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Surveys</h2>
        <p className="mt-1 text-sm text-gray-600">View and respond to assigned surveys</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-50 p-3">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 p-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Available Surveys</h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-6">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">
                Failed to load surveys. Please try again later.
              </p>
            </CardContent>
          </Card>
        ) : !surveys || surveys.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Inbox className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No surveys available</h3>
              <p className="text-sm text-gray-600">
                You don&apos;t have any surveys assigned to you at the moment.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Check back later or contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{survey.title}</CardTitle>
                        {survey.isSubmitted && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        {survey.visibility === 'public' ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Public survey
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Private survey
                          </>
                        )}
                        {survey.isSubmitted && survey.submittedAt && (
                          <span className="text-xs">
                            • Submitted on {new Date(survey.submittedAt).toLocaleDateString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {!survey.isSubmitted && (
                      <Link href={`/dashboard/surveys/${survey.id}/submit`}>
                        <Button>Start Survey</Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
