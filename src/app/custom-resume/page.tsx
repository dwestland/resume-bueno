'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCustomizedResume } from './actions'
import { useSession } from 'next-auth/react'
import { InsufficientCreditsDialog } from '@/components/InsufficientCreditsDialog'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'

// Define custom resume schema using Zod
const customResumeSchema = z.object({
  job_description: z
    .string()
    .min(200, 'Job description must be at least 200 characters'),
  // .min(500, 'Job description must not exceed 5000 characters'),
})

type CustomResumeFormValues = z.infer<typeof customResumeSchema>

type GenerationStep = 'evaluation' | 'resume' | 'cover_letter' | 'title'

type GenerationResult = {
  evaluation?: string
  resume?: string
  cover_letter?: string
  title?: string
}

export default function CustomResumePage() {
  const { data: session } = useSession()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null)
  const [completedSteps, setCompletedSteps] = useState<GenerationStep[]>([])
  const [results, setResults] = useState<GenerationResult>({})
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomResumeFormValues>({
    resolver: zodResolver(customResumeSchema),
  })

  const onSubmit = async (data: CustomResumeFormValues) => {
    setIsGenerating(true)
    setSubmitStatus(null)
    setResults({})
    setCompletedSteps([])

    try {
      const steps: GenerationStep[] = [
        'evaluation',
        'resume',
        'cover_letter',
        'title',
      ]

      const allResults: Record<string, string> = {}

      // Process each step sequentially
      for (const step of steps) {
        setCurrentStep(step)

        const formData = new FormData()
        formData.append('job_description', data.job_description.trim())

        // Add all previous results to FormData
        Object.entries(allResults).forEach(([key, value]) => {
          formData.append(key, value)
        })

        const result = await createCustomizedResume(formData, step)

        if (!result.success) {
          if (result.errorType === 'INSUFFICIENT_CREDITS') {
            setShowInsufficientCreditsDialog(true)
          }
          setSubmitStatus({
            type: 'error',
            message: result.error || 'Failed to generate custom resume',
          })
          return
        }

        allResults[step] = result.data
        setResults((prev) => ({
          ...prev,
          [step]: result.data,
        }))
        setCompletedSteps((prev) => [...prev, step])

        if (result.credits !== undefined) {
          window.postMessage({
            type: 'CREDIT_UPDATE',
            credits: result.credits,
            userEmail: session?.user?.email,
          })
        }
      }

      setSubmitStatus({
        type: 'success',
        message: 'Custom resume package generated successfully!',
      })
    } catch (error) {
      console.error('Error generating custom resume:', error)
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate custom resume',
      })
    } finally {
      setIsGenerating(false)
      setCurrentStep(null)
    }
  }

  // Helper function to determine if a step should be shown
  const shouldShowStep = (step: GenerationStep) => {
    const stepOrder = ['evaluation', 'resume', 'cover_letter', 'title']
    const currentStepIndex = stepOrder.indexOf(currentStep || '')
    const stepIndex = stepOrder.indexOf(step)
    return stepIndex <= currentStepIndex || completedSteps.includes(step)
  }

  // Step details for visual display
  const stepDetails = {
    evaluation: {
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
      title: 'Evaluation',
      description: 'AI analysis of your fit for the role',
    },
    resume: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      title: 'Resume Improvement Suggestions',
      description: 'Tailored recommendations for your resume',
    },
    cover_letter: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'Cover Letter',
      description: 'Personalized cover letter for this position',
    },
    title: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      title: 'Title',
      description: 'Optimized professional title for your application',
    },
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <InsufficientCreditsDialog
        open={showInsufficientCreditsDialog}
        onOpenChange={setShowInsufficientCreditsDialog}
      />

      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-teal-600 pb-2">
          Create Custom Resume Package
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
          Get a complete AI-powered application package tailored to your target
          job
        </p>
      </div>

      {/* Feature Box */}
      <div className="mb-10 rounded-2xl bg-violet-50 border border-violet-100 shadow-sm overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-violet-500 rounded-xl mr-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              AI-Powered Application Package
            </h2>
          </div>
          <p className="mb-4 text-gray-700">
            This powerful tool will create a complete application package
            including:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 inline-flex p-1.5 rounded-md bg-teal-100">
                <svg
                  className="w-5 h-5 text-teal-700"
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
              <p className="ml-3 text-gray-700">Job fit evaluation</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 inline-flex p-1.5 rounded-md bg-violet-100">
                <svg
                  className="w-5 h-5 text-violet-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">
                Customized resume suggestions
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 inline-flex p-1.5 rounded-md bg-teal-100">
                <svg
                  className="w-5 h-5 text-teal-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">Tailored cover letter</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 inline-flex p-1.5 rounded-md bg-violet-100">
                <svg
                  className="w-5 h-5 text-violet-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">
                Professional title optimization
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center">
            <div className="h-8 w-8 bg-teal-500 rounded-full flex items-center justify-center mr-3">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              Job Description
            </h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Paste the complete job description here. Our AI will analyze it to
              create a tailored application package.
            </p>
            <div className="space-y-2">
              <textarea
                id="job_description"
                {...register('job_description')}
                rows={12}
                placeholder="Paste the job description here..."
                className={`w-full px-4 py-3 text-gray-700 border rounded-xl focus:ring-2 transition-shadow duration-200 ${
                  errors.job_description
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-300 focus:ring-teal-100 focus:border-teal-400'
                }`}
              />
              {errors.job_description && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.job_description.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating your package...
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate Custom Resume Package
              </span>
            )}
          </Button>
        </div>

        {submitStatus && (
          <div
            className={`mt-6 p-4 rounded-xl border shadow-sm flex items-start transition-all duration-300 animate-fade-in ${
              submitStatus.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div
              className={`p-1.5 rounded-full mr-3 flex-shrink-0 ${
                submitStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm">{submitStatus.message}</p>
          </div>
        )}

        {/* Generation Results */}
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
                        Below are specific suggestions to improve your resume
                        for this position. Each suggestion includes an
                        explanation and text you can copy directly into your
                        resume.
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
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center">
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
                      Optimizing your professional title...
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                All Done!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your custom resume package is ready. You can now use these
                suggestions to improve your application materials.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
