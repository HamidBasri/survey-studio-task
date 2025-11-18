'use client'

import { DynamicSurveyForm } from '@/components/survey/dynamic-survey-form'
import { Button } from '@/components/ui/button'
import type { SurveyConfig } from '@/lib/config/survey'
import { parseSurveyConfig } from '@/lib/config/survey-parser'
import { useCreateSurvey } from '@/lib/hooks/use-surveys'
import { AlertCircle, ArrowLeft, CheckCircle, FileJson, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

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

export default function NewSurveyPage() {
  const router = useRouter()
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [parsedConfig, setParsedConfig] = useState<SurveyConfig | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const lineNumbersRef = useRef<HTMLDivElement | null>(null)
  const lines = jsonInput.split('\n')

  const createSurvey = useCreateSurvey()

  const handleValidate = () => {
    setIsValidating(true)
    setParseError(null)
    setParsedConfig(null)

    // Small delay to show validation state
    setTimeout(() => {
      const result = parseSurveyConfig(jsonInput)

      if (!result.success) {
        setParseError(result.error)
      } else {
        setParsedConfig(result.data)
      }
      setIsValidating(false)
    }, 300)
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
                <FileJson className="h-8 w-8 text-blue-600" />
                Create New Survey
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter your survey JSON configuration and preview it before publishing.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* JSON Editor Section */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">JSON Configuration</h2>

              <div className="relative h-[600px] w-full overflow-y-scroll rounded-md border border-gray-300 bg-gray-50 font-mono text-sm">
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
                  <textarea
                    value={jsonInput}
                    onChange={(e) => {
                      setJsonInput(e.target.value)
                      setParsedConfig(null)
                      setParseError(null)
                    }}
                    onScroll={(e) => {
                      if (lineNumbersRef.current) {
                        lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop
                      }
                    }}
                    className="h-full min-w-0 flex-1 resize-none border-0 bg-transparent px-4 py-4 text-xs leading-5 focus:outline-none focus:ring-0"
                    placeholder="Enter your survey JSON here..."
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || !jsonInput.trim()}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800">Validation Error</h3>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                        {parseError}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {parsedConfig && (
                <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="text-sm font-semibold text-green-800">Valid Configuration</h3>
                      <p className="text-xs text-green-700">
                        {parsedConfig.questions.length} questions parsed successfully
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Live Preview</h2>

              {!parsedConfig ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <FileJson className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-600">No preview available</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Validate your JSON to see the preview
                    </p>
                  </div>
                </div>
              ) : (
                <div className="min-h-[600px] max-h-[650px] overflow-y-scroll rounded-lg border border-gray-200 bg-gray-50 p-6">
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
      </main>
    </div>
  )
}
