'use client'

import type { SurveyConfig } from '@/lib/config/survey'
import type { ID } from '@/lib/db/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type UserSurvey = {
  id: ID
  title: string
  config: SurveyConfig
  visibility: 'public' | 'private'
  creatorId: ID
  createdAt: Date
  isSubmitted: boolean
  submittedAt: Date | null
}

export type SubmitResponseDto = {
  surveyId: ID
  answers: Record<string, unknown>
}

const USER_SURVEYS_QUERY_KEY = ['user-surveys'] as const

/**
 * Fetch surveys available to the current user
 */
async function fetchUserSurveys(): Promise<UserSurvey[]> {
  const response = await fetch('/api/user/surveys', {
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
 * Submit a survey response
 */
async function submitResponse(dto: SubmitResponseDto): Promise<unknown> {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to submit response' }))
    throw new Error(error.message || 'Failed to submit response')
  }

  const data = await response.json()
  return data.response
}

/**
 * Hook to fetch user's available surveys
 */
export function useUserSurveys() {
  return useQuery({
    queryKey: USER_SURVEYS_QUERY_KEY,
    queryFn: fetchUserSurveys,
  })
}

/**
 * Hook to submit a survey response
 */
export function useSubmitResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitResponse,
    onSuccess: () => {
      // Invalidate and refetch user surveys to update submission status
      queryClient.invalidateQueries({ queryKey: USER_SURVEYS_QUERY_KEY })
    },
  })
}
