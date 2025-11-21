'use client'

import type { SurveyConfig } from '@/lib/config/survey'
import type { ID } from '@/lib/db/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type Survey = {
  id: ID
  title: string
  config: SurveyConfig
  visibility: 'public' | 'private'
  creatorId: ID
  createdAt: Date
  responseCount: number
  assignedUserCount: number
}

export type CreateSurveyDto = {
  title: string
  config: SurveyConfig
  visibility: 'public' | 'private'
  assignedUserIds?: ID[]
}

const SURVEYS_QUERY_KEY = ['surveys'] as const

/**
 * Fetch all surveys (admin only)
 */
async function fetchSurveys(): Promise<Survey[]> {
  const response = await fetch('/api/surveys', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch surveys' }))
    throw new Error(error.message || 'Failed to fetch surveys')
  }

  const data = await response.json()
  return data.surveys
}

/**
 * Create a new survey (admin only)
 */
async function createSurvey(dto: CreateSurveyDto): Promise<Survey> {
  const response = await fetch('/api/surveys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create survey' }))
    throw new Error(error.message || 'Failed to create survey')
  }

  const data = await response.json()
  return data.survey
}

/**
 * Hook to fetch all surveys
 */
export function useSurveys() {
  return useQuery({
    queryKey: SURVEYS_QUERY_KEY,
    queryFn: fetchSurveys,
  })
}

/**
 * Hook to create a new survey
 */
export function useCreateSurvey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSurvey,
    onSuccess: () => {
      // Invalidate and refetch surveys list
      queryClient.invalidateQueries({ queryKey: SURVEYS_QUERY_KEY })
    },
  })
}

/**
 * Delete a survey and all its responses (admin only)
 */
async function deleteSurvey(surveyId: ID): Promise<void> {
  const response = await fetch(`/api/surveys/${surveyId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete survey' }))
    throw new Error(error.message || 'Failed to delete survey')
  }
}

/**
 * Hook to delete a survey
 */
export function useDeleteSurvey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSurvey,
    onSuccess: () => {
      // Invalidate and refetch surveys list
      queryClient.invalidateQueries({ queryKey: SURVEYS_QUERY_KEY })
    },
  })
}
