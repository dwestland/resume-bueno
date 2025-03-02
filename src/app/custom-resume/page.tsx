'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCustomizedResume, createMatchingResume } from './actions'
import { useSession } from 'next-auth/react'
import { InsufficientCreditsDialog } from '@/components/InsufficientCreditsDialog'
import { Button } from '@/components/ui/button'
import ResumePackageResults from '@/components/ResumePackageResults'
import MatchingResumeResults from '@/components/MatchingResumeResults'

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

type GenerationMode = 'package' | 'matching' | null

export default function CustomResumePage() {
  const { data: session } = useSession()
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<GenerationMode>(null)
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null)
  const [completedSteps, setCompletedSteps] = useState<GenerationStep[]>([])
  const [results, setResults] = useState<GenerationResult>({})
  const [matchingResume, setMatchingResume] = useState<string | null>(null)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomResumeFormValues>({
    resolver: zodResolver(customResumeSchema),
  })

  const stepDetails = {
    evaluation: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      title: 'Job Fit Evaluation',
      description: 'Analysis of how well your profile matches the job',
    },
    resume: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      title: 'Resume Improvement',
      description: 'Tailored suggestions to improve your resume',
    },
    cover_letter: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: 'Professional Title',
      description: 'Optimized title for your application',
    },
  }

  const onSubmitResumePackage = async (data: CustomResumeFormValues) => {
    setIsGenerating(true)
    setGenerationMode('package')
    setSubmitStatus(null)
    setResults({})
    setCompletedSteps([])
    setMatchingResume(null)

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
            message: result.error || 'Failed to generate Resume Package',
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
            : 'Failed to generate Resume Package',
      })
    } finally {
      setIsGenerating(false)
      setCurrentStep(null)
    }
  }

  const onSubmitMatchingResume = async (data: CustomResumeFormValues) => {
    if (!session?.user?.email) {
      setSubmitStatus({
        type: 'error',
        message: 'You must be logged in to generate a matching resume',
      })
      return
    }

    setIsGenerating(true)
    setGenerationMode('matching')
    setSubmitStatus(null)
    setResults({})
    setCompletedSteps([])
    setMatchingResume(null)

    try {
      const result = await createMatchingResume(
        data.job_description.trim(),
        session.user.email
      )

      if (!result.success) {
        if (result.errorType === 'INSUFFICIENT_CREDITS') {
          setShowInsufficientCreditsDialog(true)
        }
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to generate Matching Resume',
        })
        return
      }

      // Make sure we have valid markdown content
      const content = result.data || ''
      setMatchingResume(content)

      if (result.credits !== undefined) {
        window.postMessage({
          type: 'CREDIT_UPDATE',
          credits: result.credits,
          userEmail: session.user.email,
        })
      }

      setSubmitStatus({
        type: 'success',
        message: 'Matching resume generated successfully!',
      })
    } catch (error) {
      console.error('Error generating matching resume:', error)
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate Matching Resume',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <InsufficientCreditsDialog
        open={showInsufficientCreditsDialog}
        onOpenChange={setShowInsufficientCreditsDialog}
      />

      <h1 className="text-3xl font-bold text-center mb-10">
        Create Your Custom Resume
      </h1>

      <form
        onSubmit={handleSubmit(onSubmitResumePackage)}
        className="space-y-8"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="job_description"
              className="block text-sm font-medium mb-2"
            >
              Job Description
            </label>
            <textarea
              id="job_description"
              rows={8}
              className={`w-full px-4 py-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.job_description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
              } ${
                isGenerating ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
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

        {/* Button Container */}
        <div
          id="button-container"
          className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-6 mb-8"
        >
          {/* Left Column - Resume Package */}
          <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-3">
            <Button
              type="submit"
              className={`w-full px-6 py-4 text-base font-medium rounded-md shadow-sm ${
                isGenerating ? 'opacity-80 cursor-not-allowed' : ''
              }`}
              disabled={isGenerating}
              onClick={(e) => {
                e.preventDefault()
                handleSubmit(onSubmitResumePackage)()
              }}
            >
              {isGenerating && generationMode === 'package' ? (
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
                  Generating...
                </div>
              ) : (
                'Generate Resume Package'
              )}
            </Button>
            <p className="text-sm text-gray-600">
              Get a complete package with job evaluation, resume suggestions,
              cover letter, and optimized title.
            </p>
          </div>

          {/* Right Column - Matching Resume */}
          <div className="w-full md:w-1/2 flex flex-col items-center text-center space-y-3">
            <Button
              className={`w-full px-6 py-4 text-base font-medium rounded-md shadow-sm ${
                isGenerating ? 'opacity-80 cursor-not-allowed' : ''
              }`}
              disabled={isGenerating}
              onClick={(e) => {
                e.preventDefault()
                handleSubmit(onSubmitMatchingResume)()
              }}
            >
              {isGenerating && generationMode === 'matching' ? (
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
                  Generating...
                </div>
              ) : (
                'Generate Matching Resume'
              )}
            </Button>
            <p className="text-sm text-gray-600">
              Create a complete, tailored resume specifically formatted for this
              job description.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`text-center text-sm ${
              submitStatus.type === 'success' ? 'text-teal-600' : 'text-red-600'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        {/* Results Section */}
        {generationMode === 'package' &&
          (isGenerating || Object.keys(results).length > 0) && (
            <ResumePackageResults
              results={results}
              currentStep={currentStep}
              completedSteps={completedSteps}
              stepDetails={stepDetails}
            />
          )}

        {/* Matching Resume Results */}
        {generationMode === 'matching' && (
          <MatchingResumeResults
            matchingResume={matchingResume}
            isGenerating={isGenerating}
          />
        )}
      </form>
    </div>
  )
}
