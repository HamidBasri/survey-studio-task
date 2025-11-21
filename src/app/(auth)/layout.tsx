import { requireGuest } from '@/lib/auth'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

interface AuthLayoutProps {
  children: ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  await requireGuest()

  return (
    <div className="flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-sm min-h-[420px] flex items-center">{children}</div>
    </div>
  )
}
