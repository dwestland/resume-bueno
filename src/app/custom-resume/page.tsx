'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCustomizedResume } from './actions'
import { useSession } from 'next-auth/react'
import { InsufficientCreditsDialog } from '@/components/InsufficientCreditsDialog'
import { Button } from '@/components/ui/button'
import ResumePackageResults from '@/components/ResumePackageResults'

// Define custom resume schema using Zod
const customResumeSchema = z.object({
  job_description: z
    .string()
    .min(200, 'Job description must be at least 200 characters'),
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
              Custom Resume Package
            </h2>
          </div>
          <div className="mt-2 mb-8 grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-md bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                AI-powered job fit evaluation based on the posted job
                description
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-md bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Tailored resume improvement suggestions to stand out
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-md bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Customized cover letter highlighting your relevant strengths
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-md bg-teal-100 text-teal-600 mr-3">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-700">
                Optimized professional title for your application
              </p>
            </div>
          </div>
          <p className="text-violet-700 font-medium text-sm">
            This generation consumes{' '}
            <span className="font-semibold">4 Genius Credits</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Job Description Input */}
        <div className="mb-6">
          <label
            htmlFor="job_description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Paste Job Description
          </label>
          <div className="relative">
            <textarea
              id="job_description"
              className={`block w-full rounded-md border border-gray-300 shadow-sm px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm h-52 ${
                errors.job_description
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : ''
              }`}
              placeholder="Paste the complete job description here..."
              {...register('job_description')}
              disabled={isGenerating}
            ></textarea>
            {errors.job_description && (
              <p className="mt-2 text-sm text-red-600">
                {errors.job_description.message}
              </p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Paste the full job description. The more detailed, the better
            results you&apos;ll get.
          </p>
        </div>

        {/* Submit Button */}
        <div
          id="button-container"
          className="flex flex-col items-center justify-center space-y-4 mb-8 bg-red-200"
        >
          <Button
            type="submit"
            className={`w-full md:w-auto px-8 py-6 text-base font-medium rounded-md shadow-sm ${
              isGenerating ? 'opacity-80 cursor-not-allowed' : ''
            }`}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-white animate-spin"
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
                Generating Resume Package...
              </div>
            ) : (
              'Generate Custom Resume Package'
            )}
          </Button>

          {/* Status Message */}
          {submitStatus && (
            <div
              className={`mt-2 text-sm ${
                submitStatus.type === 'success'
                  ? 'text-teal-600'
                  : 'text-red-600'
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </div>

        {/* Results Section */}
        {(isGenerating || Object.keys(results).length > 0) && (
          <ResumePackageResults
            results={results}
            currentStep={currentStep}
            completedSteps={completedSteps}
            stepDetails={stepDetails}
          />
        )}
      </form>
    </div>
  )
}
