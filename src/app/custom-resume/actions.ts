'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000,
})

const openaiModel = 'gpt-4o-mini'

// Custom error class for better error handling
class CustomResumeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomResumeError'
  }
}

async function generateJobEvaluation(resume: string, jobDescription: string) {
  const startTime = Date.now()
  console.log('Starting job evaluation generation...')

  try {
    const prompt = `Please evaluate the following resume against the job description and provide two separate ratings:

    RESUME:
    ${resume}

    JOB DESCRIPTION:
    ${jobDescription}

    Please provide two evaluations:
    1. Resume Match Score (0-10): Rate how well the resume matches the job requirements with a brief explanation.
    2. Employer Quality Score (0-10): Evaluate the quality of the employer/position based on the job description with a brief explanation.`

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content: 'You are an expert job market analyst and resume evaluator.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Failed to generate evaluation')
    }

    const duration = Date.now() - startTime
    console.log(`Job evaluation completed in ${duration}ms`)
    return completion.choices[0].message.content
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      'Error generating job evaluation:',
      error,
      `(after ${duration}ms)`
    )
    throw new CustomResumeError('Failed to generate job evaluation')
  }
}

async function generateCustomizedResume(
  resume: string,
  jobDescription: string
) {
  const startTime = Date.now()
  console.log('Starting resume customization...')

  try {
    const prompt = `Create a tailored version of this resume to match the job description perfectly.

    RESUME:
    ${resume}

    JOB DESCRIPTION:
    ${jobDescription}

    Please provide only the modified resume content, optimized to match the job requirements.`

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional resume writer who specializes in customizing resumes to match job descriptions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Failed to generate custom resume')
    }

    const duration = Date.now() - startTime
    console.log(`Resume customization completed in ${duration}ms`)
    return completion.choices[0].message.content
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      'Error generating custom resume:',
      error,
      `(after ${duration}ms)`
    )
    throw new CustomResumeError('Failed to generate custom resume')
  }
}

async function generateCoverLetter(
  customResume: string,
  jobDescription: string
) {
  const startTime = Date.now()
  console.log('Starting cover letter generation...')

  try {
    const prompt = `Write a compelling cover letter based on this customized resume and job description.

    CUSTOMIZED RESUME:
    ${customResume}

    JOB DESCRIPTION:
    ${jobDescription}

    Please write a professional cover letter that highlights the key qualifications and demonstrates enthusiasm for the role.`

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional cover letter writer who creates compelling, personalized cover letters.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Failed to generate cover letter')
    }

    const duration = Date.now() - startTime
    console.log(`Cover letter generation completed in ${duration}ms`)
    return completion.choices[0].message.content
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      'Error generating cover letter:',
      error,
      `(after ${duration}ms)`
    )
    throw new CustomResumeError('Failed to generate cover letter')
  }
}

async function generateTitle(jobDescription: string) {
  const startTime = Date.now()
  console.log('Starting title generation...')

  try {
    const prompt = `Extract the employer's name and job title from this job description and combine them into a concise title.

    JOB DESCRIPTION:
    ${jobDescription}

    Please provide only the combined title in the format: "[Employer Name] - [Job Title]"`

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that creates concise, accurate job titles.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Failed to generate title')
    }

    const duration = Date.now() - startTime
    console.log(`Title generation completed in ${duration}ms`)
    return completion.choices[0].message.content
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Error generating title:', error, `(after ${duration}ms)`)
    throw new CustomResumeError('Failed to generate title')
  }
}

export type StepUpdate = {
  step: 'evaluation' | 'resume' | 'cover_letter' | 'title' | 'saving'
}

export type CustomResumeInput = FormData | { job_description: string }

export type StepResult = {
  step: 'evaluation' | 'resume' | 'cover_letter' | 'title'
  result: string
}

export async function generateStep(
  step: 'evaluation' | 'resume' | 'cover_letter' | 'title',
  jobDescription: string,
  resume: string,
  previousResults: Record<string, string> = {}
) {
  switch (step) {
    case 'evaluation':
      return await generateJobEvaluation(resume, jobDescription)
    case 'resume':
      return await generateCustomizedResume(resume, jobDescription)
    case 'cover_letter':
      if (!previousResults.resume)
        throw new Error('Resume required for cover letter')
      return await generateCoverLetter(previousResults.resume, jobDescription)
    case 'title':
      return await generateTitle(jobDescription)
    default:
      throw new Error('Invalid step')
  }
}

export type CustomResumeResponse = {
  success: boolean
  data: string
  credits?: number
  error?: string
}

export async function createCustomizedResume(
  input: CustomResumeInput,
  step: 'evaluation' | 'resume' | 'cover_letter' | 'title'
): Promise<CustomResumeResponse> {
  let jobDescription: string

  // Handle both FormData and plain object input
  if (input instanceof FormData) {
    const formJobDescription = input.get('job_description')
    if (
      !formJobDescription ||
      typeof formJobDescription !== 'string' ||
      !formJobDescription.trim()
    ) {
      throw new CustomResumeError(
        'Job description is required and must not be empty'
      )
    }
    jobDescription = formJobDescription.trim()
  } else {
    if (!input.job_description || !input.job_description.trim()) {
      throw new CustomResumeError(
        'Job description is required and must not be empty'
      )
    }
    jobDescription = input.job_description.trim()
  }

  const session = await auth()
  if (!session?.user?.email) {
    throw new CustomResumeError('Not authenticated')
  }

  try {
    // Check if user has enough credits when starting a new resume (evaluation step)
    if (step === 'evaluation') {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { credits: true },
      })

      if (!user || user.credits < 1) {
        throw new CustomResumeError(
          'Insufficient credits. Please purchase more credits to continue.'
        )
      }
    }

    // Retrieve the user's original resume
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    if (!user?.resume) {
      throw new CustomResumeError(
        'No resume found. Please create a resume first.'
      )
    }

    // Get the previous results from FormData if they exist
    const previousResults: Record<string, string> = {}
    if (input instanceof FormData) {
      const prevEval = input.get('evaluation')
      const prevResume = input.get('resume')
      const prevCover = input.get('cover_letter')
      if (prevEval && typeof prevEval === 'string')
        previousResults.evaluation = prevEval
      if (prevResume && typeof prevResume === 'string')
        previousResults.resume = prevResume
      if (prevCover && typeof prevCover === 'string')
        previousResults.cover_letter = prevCover
    }

    // Generate the requested step
    const result = await generateStep(
      step,
      jobDescription,
      user.resume,
      previousResults
    )

    // If this is the final step (title), save everything to the database
    if (step === 'title' && input instanceof FormData) {
      const evaluation = input.get('evaluation') as string
      const customResume = input.get('resume') as string
      const coverLetter = input.get('cover_letter') as string

      // Use a transaction to ensure both operations succeed or fail together
      const [, updatedUser] = await prisma.$transaction([
        // Create the custom resume
        prisma.customResume.create({
          data: {
            title: result,
            job_description: jobDescription,
            job_evaluation: evaluation,
            custom_resume: customResume,
            cover_letter: coverLetter,
            users: {
              create: {
                user: {
                  connect: {
                    email: session.user.email,
                  },
                },
              },
            },
          },
        }),
        // Deduct one credit from the user's account
        prisma.user.update({
          where: { email: session.user.email },
          data: {
            credits: {
              decrement: 1,
            },
          },
          select: {
            credits: true,
          },
        }),
      ])

      return {
        success: true,
        data: result,
        credits: updatedUser.credits,
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Failed to create custom resume:', error)

    if (error instanceof OpenAI.APIError) {
      const errorMessage =
        error.status === 429
          ? 'Rate limit exceeded. Please try again later.'
          : `OpenAI API error: ${error.message}`
      throw new CustomResumeError(errorMessage)
    }

    if (error instanceof CustomResumeError) {
      throw error
    }

    throw new CustomResumeError(
      'Failed to create custom resume. Please try again.'
    )
  }
}
