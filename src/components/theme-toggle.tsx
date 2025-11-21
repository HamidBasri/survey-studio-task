'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/providers/theme-provider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full border border-border bg-card/80 text-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
    >
      <Sun className={`h-4 w-4 ${theme === 'dark' ? 'hidden' : ''}`} />
      <Moon className={`h-4 w-4 ${theme === 'dark' ? '' : 'hidden'}`} />
      <span className="sr-only">Toggle dark mode</span>
    </Button>
  )
}
