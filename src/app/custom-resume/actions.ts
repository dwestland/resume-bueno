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

async function generateCustomizedResume(
  originalResume: string,
  jobDescription: string
) {
  // Start time measurement
  const startTime = Date.now()

  try {
    const prompt = `Take the following resume and modify it as best you can to make it qualify for the job description.

    RESUME:
    ${originalResume}

    JOB DESCRIPTION:
    ${jobDescription}

    Please provide only the modified resume content without any additional commentary.`

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      //   model: 'gpt-4o-mi÷ni-realtime-preview',
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
      store: true,
    })

    const customizedResume = completion.choices[0]?.message?.content
    if (!customizedResume) {
      throw new CustomResumeError('Failed to generate customized resume')
    }

    // Log the time taken to process
    const endTime = Date.now()
    console.log(
      `### [generateCustomizedResume] Process took: ${endTime - startTime} ms`
    )

    return customizedResume
  } catch (error) {
    console.error('Error generating custom resume:', error)
    if (error instanceof OpenAI.APIError) {
      // Handle specific API errors
      const errorMessage =
        error.status === 429
          ? 'Rate limit exceeded. Please try again later.'
          : `OpenAI API error: ${error.message}`
      throw new CustomResumeError(errorMessage)
    }
    throw new CustomResumeError('Failed to generate customized resume')
  }
}

export async function createCustomizedResume(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new CustomResumeError('Not authenticated')
  }

  const jobDescription = formData.get('job_description') as string
  if (!jobDescription) {
    throw new CustomResumeError('Job description is required')
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

    // Generate a customized resume using OpenAI
    const customizedResume = await generateCustomizedResume(
      user.resume,
      jobDescription
    )

    // Save the customized resume to the database
    const customResume = await prisma.customResume.create({
      data: {
        job_description: jobDescription,
        custom_resume: customizedResume,
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

    return { success: true, data: customResume }
  } catch (error) {
    console.error('Failed to create custom resume:', error)
    throw new CustomResumeError(
      error instanceof CustomResumeError
        ? error.message
        : 'Failed to create custom resume'
    )
  }
}
