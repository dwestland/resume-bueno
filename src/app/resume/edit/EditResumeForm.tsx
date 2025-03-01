'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateResume } from '../actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SaveIcon, AlertCircle, CheckCircle2 } from 'lucide-react'

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

interface EditResumeFormProps {
  defaultValues: Partial<ResumeFormValues>
}

// Define field interface to make TypeScript happy
interface ResumeField {
  name: keyof ResumeFormValues
  label: string
  rows: number
  placeholder: string
  required: boolean
  description: string
}

export default function EditResumeForm({ defaultValues }: EditResumeFormProps) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

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
    } catch (error: unknown) {
      console.error('Error updating resume:', error)
      let message = 'Failed to update resume. Please try again.'
      if (error instanceof Error) message = error.message
      setSubmitStatus({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputSections: { title: string; fields: ResumeField[] }[] = [
    {
      title: 'Essential Information',
      fields: [
        {
          name: 'resume',
          label: 'Resume',
          rows: 10,
          placeholder: 'Enter your resume (minimum 500 characters)',
          required: true,
          description:
            'This is the main content of your resume, including your professional summary and key qualifications.',
        },
      ],
    },
    {
      title: 'Background & Experience',
      fields: [
        {
          name: 'education',
          label: 'Education',
          rows: 4,
          placeholder: 'Enter your education history',
          required: false,
          description:
            'List your degrees, majors, institutions, and graduation dates.',
        },
        {
          name: 'certificates',
          label: 'Certificates',
          rows: 3,
          placeholder: 'List your certificates',
          required: false,
          description:
            'Include relevant certifications, their issuers, and dates.',
        },
        {
          name: 'experience',
          label: 'Experience',
          rows: 6,
          placeholder: 'Describe your work experience',
          required: false,
          description:
            'Detail your job history, roles, responsibilities, and accomplishments.',
        },
      ],
    },
    {
      title: 'Skills & Achievements',
      fields: [
        {
          name: 'skills',
          label: 'Skills',
          rows: 4,
          placeholder: 'List your skills',
          required: false,
          description: 'Include technical, soft, and industry-specific skills.',
        },
        {
          name: 'projects',
          label: 'Projects',
          rows: 4,
          placeholder: 'Describe your projects',
          required: false,
          description:
            'Detail significant projects, their scope, and your contributions.',
        },
        {
          name: 'awards',
          label: 'Awards',
          rows: 3,
          placeholder: 'List your awards and achievements',
          required: false,
          description:
            'Include recognitions, honors, and achievements with dates.',
        },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'training',
          label: 'Training',
          rows: 3,
          placeholder: 'List your training and certifications',
          required: false,
          description:
            'Mention workshops, bootcamps, and additional training programs.',
        },
        {
          name: 'volunteering',
          label: 'Volunteering',
          rows: 3,
          placeholder: 'Describe your volunteer work',
          required: false,
          description: 'Share community involvement and volunteer positions.',
        },
        {
          name: 'hobbies_interests',
          label: 'Hobbies & Interests',
          rows: 3,
          placeholder: 'Share your hobbies and interests',
          required: false,
          description:
            'Include relevant hobbies that demonstrate skills or character.',
        },
      ],
    },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {inputSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-6">
          <div className="border-b border-gray-200 pb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {section.title}
            </h2>
          </div>

          {section.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {errors[field.name] && (
                  <p className="text-red-500 text-sm">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>

              {field.description && (
                <p className="text-xs text-gray-500 mb-1">
                  {field.description}
                </p>
              )}

              <textarea
                id={field.name}
                {...register(field.name)}
                rows={field.rows}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 text-[#0a0a0a] border rounded-md shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
                  errors[field.name]
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
              />
            </div>
          ))}
        </div>
      ))}

      {submitStatus && (
        <div
          className={`flex items-start gap-3 p-4 rounded-md ${
            submitStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {submitStatus.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>{submitStatus.message}</div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-col justify-end space-y-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
            size="lg"
          >
            <SaveIcon className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          {!isDirty && (
            <p className="text-xs text-gray-500 text-right">
              Make changes to enable the save button
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
