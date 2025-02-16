'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  try {
    const prompt = `Take the following resume and modify it as best you can to make it qualify for the job description. 
    
    RESUME:
    ${originalResume}

    JOB DESCRIPTION:
    ${jobDescription}

    Please provide only the modified resume content without any additional commentary.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4-0125-preview',
      temperature: 0.7,
    })

    const customizedResume = completion.choices[0]?.message?.content
    if (!customizedResume) {
      throw new CustomResumeError('Failed to generate customized resume')
    }

    return customizedResume
  } catch (error) {
    console.error('OpenAI API error:', error)
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
    // Get user's original resume
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    if (!user?.resume) {
      throw new CustomResumeError(
        'No resume found. Please create a resume first.'
      )
    }

    // Generate customized resume using OpenAI
    const customizedResume = await generateCustomizedResume(
      user.resume,
      jobDescription
    )

    // Save to database
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
