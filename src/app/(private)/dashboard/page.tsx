import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { getCurrentUser, signOut } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'
import { LayoutDashboard } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const isAdmin = user?.role === USER_ROLE.ADMIN

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Dashboard"
          subtitle={isAdmin ? 'Admin Panel' : 'User Portal'}
          icon={LayoutDashboard}
          actions={
            <>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold uppercase text-primary-foreground">
                  {user?.email?.[0] ?? ''}
                </div>
                <p className="max-w-[180px] truncate text-foreground sm:max-w-xs">
                  <span className="font-medium">{user?.email}</span>
                  <span className="mx-1 text-muted-foreground">•</span>
                  <span className="capitalize text-muted-foreground">
                    {user?.role === USER_ROLE.ADMIN ? 'Administrator' : 'Standard user'}
                  </span>
                </p>
              </div>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/60"
                >
                  Sign Out
                </button>
              </form>
            </>
          }
        />
      }
    >
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </DashboardLayout>
  )
}
