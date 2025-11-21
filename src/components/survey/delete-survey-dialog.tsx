'use client'

import { AlertTriangle, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DeleteSurveyDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  surveyTitle: string
  responseCount: number
}

export function DeleteSurveyDialog({
  isOpen,
  onClose,
  onConfirm,
  surveyTitle,
  responseCount,
}: DeleteSurveyDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isDeleting, onClose])

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') return

    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Failed to delete survey:', error)
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  const isConfirmValid = confirmText === 'DELETE'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-lg rounded-lg bg-card text-card-foreground shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Delete Survey</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-foreground">
            You are about to permanently delete the survey{' '}
            <strong>&quot;{surveyTitle}&quot;</strong>.
          </p>

          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/40">
            <p className="text-sm font-semibold text-red-800 dark:text-red-100">
              This action cannot be undone!
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-red-700 dark:text-red-300">
              <li>The survey will be permanently deleted</li>
              <li>
                All <strong>{responseCount}</strong>{' '}
                {responseCount === 1 ? 'response' : 'responses'} will be deleted
              </li>
              <li>All survey assignments will be removed</li>
            </ul>
          </div>

          <div className="mt-6">
            <label htmlFor="confirm-text" className="block text-sm font-medium text-foreground">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-muted"
              placeholder="Type DELETE"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Survey'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
