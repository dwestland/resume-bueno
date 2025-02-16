'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createCustomizedResume } from './actions'
import { useRouter } from 'next/navigation'

// Validation schema
const customResumeSchema = z.object({
  job_description: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(10000, 'Job description must not exceed 10,000 characters'),
})

type CustomResumeFormValues = z.infer<typeof customResumeSchema>

export default function CustomResumePage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
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

  const onSubmit = async (data: CustomResumeFormValues) => {
    setIsGenerating(true)
    setSubmitStatus(null)

    try {
      const formData = new FormData()
      formData.append('job_description', data.job_description)

      await createCustomizedResume(formData)
      setSubmitStatus({
        type: 'success',
        message: 'Custom resume generated successfully!',
      })

      // Redirect to the display page after a brief delay
      setTimeout(() => {
        router.push('/resume/display')
      }, 1500)
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
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Custom Resume</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          This tool will customize your resume to match the job description you
          provide. Please paste the complete job description below.
        </p>
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
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
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
                Generating Custom Resume...
              </span>
            ) : (
              'Generate Custom Resume'
            )}
          </button>
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
      </form>
    </div>
  )
}
