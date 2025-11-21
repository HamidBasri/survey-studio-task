import { requireAuth } from '@/lib/auth'
import { ReactQueryProvider } from '@/lib/providers/react-query-provider'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

interface PrivateLayoutProps {
  children: ReactNode
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  await requireAuth()

  return <ReactQueryProvider>{children}</ReactQueryProvider>
}
