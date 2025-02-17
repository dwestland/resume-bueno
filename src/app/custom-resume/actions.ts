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

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating job evaluation:', error)
    throw new CustomResumeError('Failed to generate job evaluation')
  }
}

async function generateCustomizedResume(
  resume: string,
  jobDescription: string
) {
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

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating custom resume:', error)
    throw new CustomResumeError('Failed to generate custom resume')
  }
}

async function generateCoverLetter(
  customResume: string,
  jobDescription: string
) {
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

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating cover letter:', error)
    throw new CustomResumeError('Failed to generate cover letter')
  }
}

async function generateTitle(jobDescription: string) {
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

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error generating title:', error)
    throw new CustomResumeError('Failed to generate title')
  }
}

export type StepUpdate = {
  step: 'evaluation' | 'resume' | 'cover_letter' | 'title' | 'saving'
}

export type CustomResumeInput = FormData | { job_description: string }

export async function createCustomizedResume(input: CustomResumeInput) {
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

    // Generate all content in sequence
    const jobEvaluation = await generateJobEvaluation(
      user.resume,
      jobDescription
    )

    const customResume = await generateCustomizedResume(
      user.resume,
      jobDescription
    )

    const coverLetter = await generateCoverLetter(customResume, jobDescription)

    const title = await generateTitle(jobDescription)

    // Save all generated content to the database
    const customResumeEntry = await prisma.customResume.create({
      data: {
        title,
        job_description: jobDescription,
        job_evaluation: jobEvaluation,
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
    })

    return { success: true, data: customResumeEntry }
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
