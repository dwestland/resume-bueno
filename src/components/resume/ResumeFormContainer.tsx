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
import { Button } from '@/components/ui/button'

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
      <div className="mb-10 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-violet-700 bg-violet-100 rounded-full">
          Step {activeStep + 1} of {formSections.length}
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {formSections[activeStep].title}
        </h1>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">{formSections[activeStep].description}</p>

          {formSections[activeStep].bulletPoints && (
            <ul className="space-y-3 list-none pl-0 mt-6">
              {formSections[activeStep].bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 mr-3 mt-0.5 flex-shrink-0 text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form className="space-y-6 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
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
              className="w-full p-8 border-2 border-dashed border-teal-300 rounded-lg flex flex-col items-center justify-center text-teal-600 hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 group"
            >
              <div className="p-3 bg-teal-50 rounded-full mb-3 group-hover:bg-teal-100 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
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
              </div>
              <p className="font-medium text-gray-800 mb-1">
                Click to upload your resume file
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOCX formats
              </p>
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200"></div>
              <p className="mx-4 text-sm font-medium text-gray-500">OR</p>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
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
            <Button
              type="button"
              onClick={() => setActiveStep((prev) => prev - 1)}
              variant="outline"
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 hover:bg-gray-50 transition-colors"
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
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Button>
          )}

          <div className={activeStep === 0 ? 'w-full' : 'ml-auto'}>
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-md shadow-sm hover:shadow transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Saving...
                </>
              ) : isLastStep ? (
                <>
                  Save and Finish
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
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </>
              ) : (
                <>
                  Save and Continue
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
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>

        {submitStatus && (
          <div
            className={`mt-4 p-4 rounded-md shadow-sm ${
              submitStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {submitStatus.type === 'success' ? (
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {submitStatus.message}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
