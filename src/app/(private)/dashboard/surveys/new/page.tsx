'use client'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DynamicSurveyForm } from '@/components/survey/dynamic-survey-form'
import type { SurveyConfig } from '@/lib/config/survey'
import { parseSurveyConfig } from '@/lib/config/survey-parser'
import { useCreateSurvey } from '@/lib/hooks/use-surveys'
import { AlertCircle, CheckCircle, FileJson, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type UIEvent, useRef, useState } from 'react'

const DEFAULT_JSON = `{
  "title": "Customer Satisfaction Survey",
  "questions": [
    {
      "type": "text",
      "label": "What is your name?",
      "name": "name",
      "validation": {
        "required": true,
        "minLength": 2
      }
    },
    {
      "type": "rating",
      "label": "How satisfied are you with our service?",
      "name": "satisfaction",
      "scale": 5,
      "validation": {
        "required": true
      }
    }
  ]
}`

type ValidationIssue = {
  path: (string | number)[]
  message: string
}

export default function NewSurveyPage() {
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [parsedConfig, setParsedConfig] = useState<SurveyConfig | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[] | null>(null)
  const [syntaxLocation, setSyntaxLocation] = useState<{ line: number; column: number } | null>(
    null,
  )
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)
  const validationTimeoutRef = useRef<number | null>(null)
  const lines = jsonInput.split('\n')

  const createSurvey = useCreateSurvey()

  const getSyntaxLocation = (json: string, errorMessage: string) => {
    const match = /position (\d+)/.exec(errorMessage)
    if (!match) return null

    const index = Number(match[1])
    if (Number.isNaN(index)) return null

    const slice = json.slice(0, index)
    const parts = slice.split('\n')
    const line = parts.length
    const lastLine = parts[parts.length - 1] ?? ''
    const column = lastLine.length + 1

    return { line, column }
  }

  const runValidation = (value: string) => {
    setIsValidating(true)
    const result = parseSurveyConfig(value)

    if (result.success) {
      setParsedConfig(result.data)
      setParseError(null)
      setValidationIssues(null)
      setSyntaxLocation(null)
    } else {
      setParsedConfig(null)
      setParseError(result.error)

      const issues = (result.details as ValidationIssue[] | undefined) ?? null
      setValidationIssues(issues && issues.length > 0 ? issues : null)

      const location = getSyntaxLocation(value, result.error)
      setSyntaxLocation(location)
    }

    setIsValidating(false)
  }

  const handleTextareaScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop
    }
  }

  const handleValidate = () => {
    if (!jsonInput.trim()) return

    if (validationTimeoutRef.current !== null) {
      window.clearTimeout(validationTimeoutRef.current)
      validationTimeoutRef.current = null
    }

    runValidation(jsonInput)
  }

  const handleSubmit = async () => {
    if (!parsedConfig) return

    try {
      await createSurvey.mutateAsync({
        title: parsedConfig.title,
        config: parsedConfig,
        visibility: 'public',
      })

      router.push('/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create survey'
      setParseError(message)
    }
  }

  return (
    <DashboardLayout
      header={
        <DashboardHeader
          title="Create New Survey"
          subtitle="Enter your survey JSON configuration and preview it before publishing."
          icon={FileJson}
          showBackButton
        />
      }
      noPadding
      fullHeight
      disableMainScroll
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6">
        {/* JSON Editor Section */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm ring-1 ring-gray-900/5">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">JSON Configuration</h2>
              <p className="mt-1 text-sm text-gray-500">Define your survey structure</p>
            </div>

            <div className="relative flex min-h-0 flex-1 overflow-hidden bg-gray-50/50 font-mono text-sm">
              <div
                ref={lineNumbersRef}
                aria-hidden="true"
                className="h-full shrink-0 select-none overflow-hidden border-r border-gray-200/60 bg-gray-100/50 px-3 py-4 text-right text-xs text-gray-400"
              >
                {lines.map((_, index) => {
                  const lineNumber = index + 1
                  const isErrorLine = syntaxLocation && syntaxLocation.line === lineNumber

                  return (
                    <div
                      key={index}
                      className={`h-6 leading-6 ${isErrorLine ? 'rounded bg-red-100 text-red-700 font-semibold' : ''}`}
                    >
                      {lineNumber}
                    </div>
                  )
                })}
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  const value = e.target.value
                  setJsonInput(value)

                  if (validationTimeoutRef.current !== null) {
                    window.clearTimeout(validationTimeoutRef.current)
                    validationTimeoutRef.current = null
                  }

                  if (!value.trim()) {
                    setParsedConfig(null)
                    setParseError(null)
                    setValidationIssues(null)
                    setSyntaxLocation(null)
                    setIsValidating(false)
                    return
                  }

                  setIsValidating(true)
                  validationTimeoutRef.current = window.setTimeout(() => {
                    runValidation(value)
                  }, 400)
                }}
                onScroll={handleTextareaScroll}
                className="flex-1 min-h-0 resize-none overflow-y-auto border-0 bg-transparent px-4 py-4 text-sm leading-6 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                placeholder="Enter your survey JSON configuration..."
                spellCheck={false}
              />
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || !jsonInput.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Validate JSON
                    </>
                  )}
                </button>

                {parsedConfig && (
                  <button
                    onClick={handleSubmit}
                    disabled={createSurvey.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {createSurvey.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Survey'
                    )}
                  </button>
                )}
              </div>

              {/* Validation Status */}
              {parseError && (
                <div className="mt-4 rounded-lg border border-red-200/60 bg-red-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                        {parseError}
                      </pre>
                      {syntaxLocation && (
                        <p className="mt-1 text-xs text-red-700">
                          Likely around line {syntaxLocation.line}, column {syntaxLocation.column}.
                        </p>
                      )}
                      {validationIssues && validationIssues.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-red-700">
                          {validationIssues.map((issue, index) => (
                            <li key={index}>
                              <span className="font-semibold">
                                {issue.path.length > 0 ? issue.path.join('.') : 'root'}:
                              </span>{' '}
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {parsedConfig && (
                <div className="mt-4 rounded-lg border border-green-200/60 bg-green-50/50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800">Valid Configuration</h3>
                      <p className="text-xs text-green-700">
                        {parsedConfig.questions.length} questions parsed successfully
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm ring-1 ring-gray-900/5">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">Live Preview</h2>
              <p className="mt-1 text-sm text-gray-500">See how your survey will look</p>
            </div>

            {!parsedConfig ? (
              <div className="flex min-h-0 flex-1 items-center justify-center bg-gray-50/30">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <FileJson className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-900">No preview available</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Validate your JSON to see the preview
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/30 p-6">
                <DynamicSurveyForm
                  config={parsedConfig}
                  onSubmit={(data) => {
                    console.log('Preview form submitted:', data)
                  }}
                  isSubmitting={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
