'use client'

import type { UserRole } from '@/lib/config/user'
import type { ID } from '@/lib/db/types'
import { useQuery } from '@tanstack/react-query'

export type UserSummary = {
  id: ID
  email: string
  role: UserRole
}

async function fetchUsers(): Promise<UserSummary[]> {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }))
    throw new Error(error.message || 'Failed to fetch users')
  }

  const data = await response.json()
  return data.users as UserSummary[]
}

const USERS_QUERY_KEY = ['users'] as const

export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: fetchUsers,
  })
}
