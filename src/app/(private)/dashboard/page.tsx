import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { UserDashboard } from '@/components/dashboard/user-dashboard'
import { getCurrentUser, signOut } from '@/lib/auth'
import { USER_ROLE } from '@/lib/config/user'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const isAdmin = user?.role === USER_ROLE.ADMIN

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200/60 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isAdmin ? 'Admin Panel' : 'User Portal'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role === USER_ROLE.ADMIN ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
              </div>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </main>
    </div>
  )
}
