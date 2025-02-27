'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ResumeSection } from './ResumeSection'
import { ProgressIndicator } from './ProgressIndicator'
import {
  resumeSchema,
  resumeFormFields,
  ResumeFormValues,
} from './resumeSchema'
import { updateResume } from '@/app/resume/actions'

// Form sections definition with fields and descriptive text
const formSections = [
  {
    title: 'Upload Your Resume',
    description: `Your resume is the foundation of your job application. Upload it now to get started.

You can either upload a resume file (PDF, DOCX) or copy and paste your resume text below. This allows Resume Bueno to analyze your experience, skills, and qualifications—ensuring we create a tailored resume that perfectly aligns with your target job.`,
    fields: ['resume'],
  },
  {
    title: 'Professional Development',
    description: `These elements showcase your formal achievements and qualifications, strengthening your resume's credibility and alignment with job requirements.`,
    bulletPoints: [
      'Certificates – Add any certifications relevant to your industry or desired role. These prove your expertise in specific skills or fields, such as IT certifications, medical licenses, or project management credentials.',
      "Training – List specialized training programs or courses you've completed. This highlights your commitment to learning and staying updated in your field.",
      'Education – Include degrees, diplomas, or other academic achievements. Education helps employers assess your qualifications and foundational knowledge.',
    ],
    fields: ['certificates', 'training', 'education'],
  },
  {
    title: 'Experience & Contributions',
    description: `This section highlights real-world applications of your skills, demonstrating how you've contributed value in professional or volunteer settings.`,
    bulletPoints: [
      'Experience – Detail previous job roles, internships, or freelance work. This helps match your background with job descriptions by emphasizing your hands-on expertise.',
      "Projects – List personal or professional projects you've worked on. Employers value project-based experience as it showcases problem-solving, innovation, and leadership.",
      'Volunteering – Include any nonprofit work or community service. Volunteer experience highlights soft skills like teamwork, leadership, and adaptability while showing your commitment to making a difference.',
    ],
    fields: ['experience', 'projects', 'volunteering'],
  },
  {
    title: 'Personal Strengths & Interests',
    description: `These details provide depth to your resume, giving hiring managers insights into your personality, soft skills, and broader capabilities.`,
    bulletPoints: [
      'Skills – List technical and soft skills that make you a strong candidate. These can range from programming languages to leadership and communication skills.',
      "Awards – Mention any honors or recognitions you've received. These showcase excellence in your field and demonstrate a history of achievement.",
      'Hobbies & Interests – Add relevant hobbies that showcase unique skills, creativity, or leadership. Certain hobbies, like blogging, coding, or public speaking, can make you stand out.',
    ],
    fields: ['skills', 'awards', 'hobbies_interests'],
  },
]

interface ResumeFormContainerProps {
  displayMode?: 'standard' | 'carousel'
  defaultValues?: Partial<ResumeFormValues>
}

export function ResumeFormContainer({
  displayMode = 'standard',
  defaultValues = {},
}: ResumeFormContainerProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step management
  const [activeStep, setActiveStep] = useState(0)
  const isLastStep = activeStep === formSections.length - 1

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      // Set the resume content from the file
      setValue('resume', content, { shouldValidate: true })
    }
    reader.readAsText(file)
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  // Handle next step navigation
  const handleNext = async () => {
    // Validate current step fields before proceeding
    const currentFields = formSections[activeStep].fields as Array<
      keyof ResumeFormValues
    >
    const isValid = await trigger(currentFields)

    if (isValid) {
      // If this is the last step, submit the form
      if (isLastStep) {
        await handleSubmit(onSubmit)()
      } else {
        // Save progress and go to next step
        saveProgress()
        setActiveStep((prev) => prev + 1)
      }
    }
  }

  // Save current progress without submitting the full form
  const saveProgress = async () => {
    try {
      setIsSubmitting(true)
      const currentValues = getValues()
      const formData = new FormData()

      Object.entries(currentValues).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      await updateResume(formData)
      setSubmitStatus({
        type: 'success',
        message: 'Progress saved successfully!',
      })
    } catch (error) {
      console.error('Error saving progress:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Failed to save progress. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 3000)
    }
  }

  const onSubmit = async (data: ResumeFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      await updateResume(formData)
      router.push('/custom-resume')
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

  // Get the field objects for the current section
  const getCurrentSectionFields = () => {
    const currentSection = formSections[activeStep]
    return resumeFormFields.filter((field) =>
      currentSection.fields.includes(field.name)
    )
  }

  return (
    <div className="max-w-4xl p-6 mx-auto">
      {/* Progress Indicator */}
      <ProgressIndicator
        steps={formSections.map((section) => section.title)}
        currentStep={activeStep}
      />

      {/* Section Title and Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Step {activeStep + 1}: {formSections[activeStep].title}
        </h1>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">{formSections[activeStep].description}</p>

          {formSections[activeStep].bulletPoints && (
            <ul className="space-y-2 list-disc pl-6">
              {formSections[activeStep].bulletPoints.map((point, index) => (
                <li key={index} className="text-gray-700">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form className="space-y-6">
        {/* File upload for resume section */}
        {activeStep === 0 && (
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.doc,.docx,.pdf"
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerFileUpload}
              className="w-full p-8 border-2 border-dashed border-blue-300 rounded-md flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="font-medium">Click to upload your resume file</p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOCX formats
              </p>
            </button>
            <p className="text-sm text-center text-gray-500 mt-2">
              or paste your resume text below
            </p>
          </div>
        )}

        {displayMode === 'standard' ? (
          // Standard display - show all fields (this mode is no longer the focus)
          resumeFormFields.map((field) => (
            <ResumeSection
              key={field.name}
              field={field}
              register={register}
              errors={errors}
            />
          ))
        ) : (
          // Default to carousel display mode
          <div className="space-y-6">
            {/* Show only the fields for the current section */}
            {getCurrentSectionFields().map((field) => (
              <ResumeSection
                key={field.name}
                field={field}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        )}

        {/* Form navigation and submission buttons */}
        <div className="flex justify-between pt-8">
          {activeStep > 0 && (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => prev - 1)}
              className="px-6 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Back
            </button>
          )}

          <div className={activeStep === 0 ? 'w-full' : 'ml-auto'}>
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? 'Saving...'
                : isLastStep
                ? 'Save and Finish'
                : 'Save and Continue'}
            </button>
          </div>
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
