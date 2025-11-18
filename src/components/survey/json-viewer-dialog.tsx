'use client'

import type { SurveyConfig } from '@/lib/config/survey'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface JsonViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  config: SurveyConfig
  title: string
}

export function JsonViewerDialog({ isOpen, onClose, config, title }: JsonViewerDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const jsonString = JSON.stringify(config, null, 2)
  const lines = jsonString.split('\n')

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={dialogRef}
        className="relative w-full max-w-4xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">JSON Configuration</h2>
            <p className="mt-1 text-sm text-gray-600">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* JSON Content */}
        <div className="p-6">
          <div className="relative h-[500px] w-full overflow-y-auto rounded-md border border-gray-300 bg-gray-50 font-mono text-sm">
            <div className="flex h-full w-full">
              <div
                ref={lineNumbersRef}
                aria-hidden="true"
                className="h-full shrink-0 select-none overflow-hidden border-r border-gray-200 bg-gray-100 px-3 py-4 text-right text-xs text-gray-500"
              >
                {lines.map((_, index) => (
                  <div key={index} className="leading-5">
                    {index + 1}
                  </div>
                ))}
              </div>
              <pre className="h-full flex-1 overflow-y-auto px-4 py-4 text-xs leading-5">
                <code>{jsonString}</code>
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(jsonString)
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
