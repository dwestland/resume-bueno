'use client'

import { ReactNode, useState } from 'react'
import ReactMarkdown from 'react-markdown'

type GenerationStep = 'evaluation' | 'resume' | 'cover_letter' | 'title'

type GenerationResult = {
  evaluation?: string
  resume?: string
  cover_letter?: string
  title?: string
}

type StepDetail = {
  icon: ReactNode
  title: string
  description: string
}

interface ResumePackageResultsProps {
  results: GenerationResult
  currentStep: GenerationStep | null
  completedSteps: GenerationStep[]
  stepDetails: Record<GenerationStep, StepDetail>
}

export default function ResumePackageResults({
  results,
  currentStep,
  completedSteps,
  stepDetails,
}: ResumePackageResultsProps) {
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false)

  // Helper function to determine if a step should be shown
  const shouldShowStep = (step: GenerationStep) => {
    const stepOrder = ['evaluation', 'resume', 'cover_letter', 'title']
    const currentStepIndex = stepOrder.indexOf(currentStep || '')
    const stepIndex = stepOrder.indexOf(step)
    return stepIndex <= currentStepIndex || completedSteps.includes(step)
  }

  // Function to copy cover letter to clipboard
  const copyToClipboard = async (
    e: React.MouseEvent<HTMLButtonElement>,
    text: string
  ) => {
    // Prevent default button behavior and form submission
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(text)
      setCopiedCoverLetter(true)
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedCoverLetter(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Progress Tracker */}
      {(currentStep || completedSteps.length > 0) && (
        <div className="relative mb-10">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-teal-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(
                  (completedSteps.length / 4) * 100,
                  currentStep
                    ? ([
                        'evaluation',
                        'resume',
                        'cover_letter',
                        'title',
                      ].indexOf(currentStep) +
                        0.5) *
                        25
                    : 0
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {['evaluation', 'resume', 'cover_letter', 'title'].map(
              (step, index) => (
                <div
                  key={step}
                  className="text-xs font-medium text-gray-500"
                  style={{ width: '25%' }}
                >
                  <div
                    className={`flex flex-col items-center mt-1 ${
                      completedSteps.includes(step as GenerationStep)
                        ? 'text-teal-600'
                        : currentStep === step
                        ? 'text-violet-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full mb-1 ${
                        completedSteps.includes(step as GenerationStep)
                          ? 'bg-teal-100'
                          : currentStep === step
                          ? 'bg-violet-100 animate-pulse'
                          : 'bg-gray-100'
                      }`}
                    >
                      {completedSteps.includes(step as GenerationStep) ? (
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs truncate w-16 text-center">
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Results Cards */}
      {shouldShowStep('evaluation') && (
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
          id="evaluation-section"
        >
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full mr-4 flex items-center justify-center
              ${
                results.evaluation
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-violet-100 text-violet-500'
              }`}
            >
              {stepDetails.evaluation.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {stepDetails.evaluation.title}
              </h2>
              <p className="text-sm text-gray-500">
                {stepDetails.evaluation.description}
              </p>
            </div>
          </div>
          <div className="p-6">
            {results.evaluation ? (
              <div className="prose prose-teal max-w-none">
                <ReactMarkdown>{results.evaluation}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-violet-50 rounded-xl">
                <svg
                  className="w-6 h-6 mr-3 text-violet-500 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="font-medium text-violet-700">
                  Analyzing your job fit...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {shouldShowStep('resume') && (
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
          id="resume-section"
        >
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full mr-4 flex items-center justify-center
              ${
                results.resume
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-violet-100 text-violet-500'
              }`}
            >
              {stepDetails.resume.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {stepDetails.resume.title}
              </h2>
              <p className="text-sm text-gray-500">
                {stepDetails.resume.description}
              </p>
            </div>
          </div>
          <div className="p-6">
            {results.resume ? (
              <div className="space-y-6">
                <div className="p-4 border border-teal-100 bg-teal-50 rounded-xl">
                  <p className="italic text-teal-800 text-sm">
                    Below are specific suggestions to improve your resume for
                    this position. Each suggestion includes an explanation and
                    text you can copy directly into your resume.
                  </p>
                </div>
                <div className="prose prose-teal max-w-none">
                  <ReactMarkdown>{results.resume}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-violet-50 rounded-xl">
                <svg
                  className="w-6 h-6 mr-3 text-violet-500 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="font-medium text-violet-700">
                  Creating tailored resume suggestions...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {shouldShowStep('cover_letter') && (
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
          id="cover-letter-section"
        >
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full mr-4 flex items-center justify-center
                ${
                  results.cover_letter
                    ? 'bg-teal-100 text-teal-600'
                    : 'bg-violet-100 text-violet-500'
                }`}
              >
                {stepDetails.cover_letter.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {stepDetails.cover_letter.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {stepDetails.cover_letter.description}
                </p>
              </div>
            </div>

            {/* Copy to Clipboard Button - Only visible when content is available */}
            {results.cover_letter && (
              <button
                onClick={(e) => copyToClipboard(e, results.cover_letter || '')}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title="Copy cover letter to clipboard"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      copiedCoverLetter
                        ? 'M5 13l4 4L19 7' // Checkmark icon when copied
                        : 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002 2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                    } // Copy icon when not copied
                  />
                </svg>
                {copiedCoverLetter ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div className="p-6">
            {results.cover_letter ? (
              <div className="prose prose-teal max-w-none">
                <ReactMarkdown>{results.cover_letter}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-violet-50 rounded-xl">
                <svg
                  className="w-6 h-6 mr-3 text-violet-500 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="font-medium text-violet-700">
                  Crafting your personalized cover letter...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {shouldShowStep('title') && (
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
          id="title-section"
        >
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full mr-4 flex items-center justify-center
              ${
                results.title
                  ? 'bg-teal-100 text-teal-600'
                  : 'bg-violet-100 text-violet-500'
              }`}
            >
              {stepDetails.title.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {stepDetails.title.title}
              </h2>
              <p className="text-sm text-gray-500">
                {stepDetails.title.description}
              </p>
            </div>
          </div>
          <div className="p-6">
            {results.title ? (
              <div className="prose prose-teal max-w-none">
                <ReactMarkdown>{results.title}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-violet-50 rounded-xl">
                <svg
                  className="w-6 h-6 mr-3 text-violet-500 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="font-medium text-violet-700">
                  Optimizing your package title...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Message */}
      {completedSteps.length === 4 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-teal-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All Done!</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Your custom resume package is ready. You can now use these
            suggestions to improve your application materials.
          </p>
        </div>
      )}
    </div>
  )
}
