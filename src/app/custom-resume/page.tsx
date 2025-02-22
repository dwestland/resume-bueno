'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCustomizedResume } from './actions'
import { useSession } from 'next-auth/react'
import { InsufficientCreditsDialog } from '@/components/InsufficientCreditsDialog'
import { Button } from '@/components/ui/button'
// Define custom resume schema using Zod
const customResumeSchema = z.object({
  job_description: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(10000, 'Job description must not exceed 10,000 characters'),
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <InsufficientCreditsDialog
        open={showInsufficientCreditsDialog}
        onOpenChange={setShowInsufficientCreditsDialog}
      />

      <h1>Create Custom Resume Package</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 mb-2">
          This tool will create a complete application package including:
        </p>
        <ul className="list-disc ml-6 text-blue-800">
          <li>Job fit evaluation</li>
          <li>Customized resume</li>
          <li>Tailored cover letter</li>
          <li>Professional title</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="job_description"
            className="block text-sm font-medium"
          >
            Job Description
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            id="job_description"
            {...register('job_description')}
            rows={12}
            placeholder="Paste the job description here..."
            className={`w-full px-3 py-2 text-[#0a0a0a] border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.job_description
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300'
            }`}
          />
          {errors.job_description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.job_description.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Generating...
              </span>
            ) : (
              'Generate Custom Resume Package'
            )}
          </Button>
        </div>

        {submitStatus && (
          <div
            className={`mt-4 p-4 rounded-md ${
              submitStatus.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Generation Results */}
        <div className="mt-8 space-y-6">
          {shouldShowStep('evaluation') && (
            <div className="p-4 bg-white text-[#0a0a0a] rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Evaluation</h2>
              {results.evaluation ? (
                <div className="whitespace-pre-line">{results.evaluation}</div>
              ) : (
                <div className="flex items-center text-blue-600">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Generating evaluation...
                </div>
              )}
            </div>
          )}

          {shouldShowStep('resume') && (
            <div className="p-4 bg-white text-[#0a0a0a] rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">
                Resume Improvement Suggestions
              </h2>
              {results.resume ? (
                <div className="space-y-6">
                  <p className="text-gray-600 italic mb-4">
                    Below are specific suggestions to improve your resume for
                    this position. Each suggestion includes an explanation and
                    text you can copy directly into your resume.
                  </p>
                  <div className="whitespace-pre-line">{results.resume}</div>
                </div>
              ) : (
                <div className="flex items-center text-blue-600">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Analyzing resume and generating suggestions...
                </div>
              )}
            </div>
          )}

          {shouldShowStep('cover_letter') && (
            <div className="p-4 bg-white text-[#0a0a0a] rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Cover Letter</h2>
              {results.cover_letter ? (
                <div className="whitespace-pre-line">
                  {results.cover_letter}
                </div>
              ) : (
                <div className="flex items-center text-blue-600">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Generating cover letter...
                </div>
              )}
            </div>
          )}

          {shouldShowStep('title') && (
            <div className="p-4 bg-white text-[#0a0a0a] rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Title</h2>
              {results.title ? (
                <div className="whitespace-pre-line">{results.title}</div>
              ) : (
                <div className="flex items-center text-blue-600">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
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
                  Generating title...
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
