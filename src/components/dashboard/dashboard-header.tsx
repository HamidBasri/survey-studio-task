import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { ArrowLeft, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

export interface DashboardHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconClassName?: string
  showBackButton?: boolean
  backHref?: string
  actions?: ReactNode
  children?: ReactNode
}

export function DashboardHeader({
  title,
  subtitle,
  icon: Icon,
  iconClassName = 'text-blue-600',
  showBackButton = false,
  backHref = '/dashboard',
  actions,
  children,
}: DashboardHeaderProps) {
  return (
    <header className="shrink-0 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          <div className="flex flex-1 items-center gap-4">
            {Icon && (
              <span
                className={`hidden h-10 w-10 items-center justify-center rounded-lg bg-blue-50 sm:inline-flex ${iconClassName}`}
              >
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 max-w-xl truncate text-xs text-muted-foreground sm:text-sm">
                  {subtitle}
                </p>
              )}
              {children}
            </div>
          </div>
          <ThemeToggle />
          {(showBackButton || actions) && (
            <div className="flex shrink-0 items-center gap-3">
              {showBackButton && (
                <Link href={backHref}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full border border-border bg-card/80 px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground sm:px-4 sm:text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              )}
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
