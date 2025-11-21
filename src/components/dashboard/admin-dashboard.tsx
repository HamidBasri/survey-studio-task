'use client'

import { SurveyGrid } from '@/components/survey/survey-grid'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Survey Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage all surveys</p>
        </div>
        <Link
          href="/dashboard/surveys/new"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Survey
        </Link>
      </div>

      <SurveyGrid />
    </div>
  )
}
