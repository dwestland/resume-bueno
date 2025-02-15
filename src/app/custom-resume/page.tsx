'use client'

import { useState } from 'react'
import { createCustomResume } from './actions'

export default function CustomResume() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const formData = new FormData(event.currentTarget)
      await createCustomResume(formData)
      setSubmitStatus({
        type: 'success',
        message: 'Job description saved successfully!',
      })
      // Clear the form
      ;(event.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error saving job description:', error)
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to save job description',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Custom Resume</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            name="job_description"
            rows={10}
            required
            placeholder="Paste the job description here..."
            className="w-full px-3 py-2 text-[#0a0a0a] border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Job Description'}
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
