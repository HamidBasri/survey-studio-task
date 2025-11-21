import type { ReactNode } from 'react'

export interface DashboardLayoutProps {
  children: ReactNode
  header?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  noPadding?: boolean
  fullHeight?: boolean
  disableMainScroll?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

export function DashboardLayout({
  children,
  header,
  maxWidth = '7xl',
  noPadding = false,
  fullHeight = false,
  disableMainScroll = false,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {header}
      <main className={`flex-1 ${disableMainScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <div
          className={`mx-auto ${maxWidthClasses[maxWidth]} ${noPadding ? '' : 'px-4 py-8 sm:px-6 lg:px-8'} ${fullHeight ? 'flex h-full flex-col' : ''}`}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
