'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateResume } from '../actions'
import { useRouter } from 'next/navigation'

// TODO: DRY
const resumeSchema = z.object({
  resume: z
    .string()
    .min(1, 'Resume is required')
    .min(200, 'Resume must be at least 200 characters'),
  education: z.string().optional(),
  certificates: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
  projects: z.string().optional(),
  awards: z.string().optional(),
  training: z.string().optional(),
  volunteering: z.string().optional(),
  hobbies_interests: z.string().optional(),
})

type ResumeFormValues = z.infer<typeof resumeSchema>

export default function AddResumePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
  })

  const onSubmit = async (data: ResumeFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      await updateResume(formData)
      router.push('/resume/display')
    } catch (error) {
      console.error('Error updating resume:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Failed to update resume. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputFields = [
    {
      name: 'resume' as const,
      label: 'Resume',
      rows: 10,
      placeholder: 'Enter your resume',
      required: true,
    },
    {
      name: 'education' as const,
      label: 'Education',
      rows: 4,
      placeholder: 'Enter your education history',
    },
    {
      name: 'certificates' as const,
      label: 'Certificates',
      rows: 3,
      placeholder: 'List your certificates',
    },
    {
      name: 'experience' as const,
      label: 'Experience',
      rows: 6,
      placeholder: 'Describe your work experience',
    },
    {
      name: 'skills' as const,
      label: 'Skills',
      rows: 4,
      placeholder: 'List your skills',
    },
    {
      name: 'projects' as const,
      label: 'Projects',
      rows: 4,
      placeholder: 'Describe your projects',
    },
    {
      name: 'awards' as const,
      label: 'Awards',
      rows: 3,
      placeholder: 'List your awards and achievements',
    },
    {
      name: 'training' as const,
      label: 'Training',
      rows: 3,
      placeholder: 'List your training and certifications',
    },
    {
      name: 'volunteering' as const,
      label: 'Volunteering',
      rows: 3,
      placeholder: 'Describe your volunteer work',
    },
    {
      name: 'hobbies_interests' as const,
      label: 'Hobbies & Interests',
      rows: 3,
      placeholder: 'Share your hobbies and interests',
    },
  ]

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Add Resume Information</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {inputFields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="block text-sm font-medium">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <textarea
              id={field.name}
              {...register(field.name)}
              rows={field.rows}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 text-[#0a0a0a] border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors[field.name]
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300'
              }`}
            />
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-500">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Resume'}
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
