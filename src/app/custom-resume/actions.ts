'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30000, // 30 seconds timeout
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
  // Start time measurement
  const startTime = Date.now()

  // Log the input parameters with distinct styles
  console.log(
    '%c [generateCustomizedResume] Original resume received:',
    'background: blue; color: white',
    originalResume
  )
  console.log(
    '%c [generateCustomizedResume] Job description received:',
    'background: green; color: white',
    jobDescription
  )

  try {
    const prompt = `Take the following resume and modify it as best you can to make it qualify for the job description. 
    
    RESUME:
    ${originalResume}

    JOB DESCRIPTION:
    ${jobDescription}

    Please provide only the modified resume content without any additional commentary.`

    // Log the constructed prompt
    console.log(
      '%c [generateCustomizedResume] Prompt constructed:',
      'background: purple; color: white',
      prompt
    )

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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

    // Log the OpenAI API response
    console.log(
      '%c [generateCustomizedResume] OpenAI completion response:',
      'background: orange; color: white',
      completion
    )

    const customizedResume = completion.choices[0]?.message?.content
    if (!customizedResume) {
      console.log(
        '%c [generateCustomizedResume] No customized resume generated!',
        'background: red; color: white'
      )
      throw new CustomResumeError('Failed to generate customized resume')
    }

    // Log the successfully generated resume
    console.log(
      '%c [generateCustomizedResume] Customized resume generated:',
      'background: teal; color: white',
      customizedResume
    )

    // Log the time taken to process
    const endTime = Date.now()
    console.log(
      `%c [generateCustomizedResume] Process took: ${endTime - startTime} ms`,
      'background: yellow; color: black'
    )

    return customizedResume
  } catch (error) {
    console.error(
      '%c [generateCustomizedResume] OpenAI API error:',
      'background: red; color: white',
      error
    )
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
  // Log the start of the custom resume creation process
  console.log(
    '%c [createCustomizedResume] Starting custom resume creation',
    'background: navy; color: white'
  )

  const session = await auth()
  if (!session?.user?.email) {
    console.log(
      '%c [createCustomizedResume] No authenticated user found',
      'background: red; color: white'
    )
    throw new CustomResumeError('Not authenticated')
  }

  const jobDescription = formData.get('job_description') as string
  if (!jobDescription) {
    console.log(
      '%c [createCustomizedResume] Job description missing from formData',
      'background: red; color: white'
    )
    throw new CustomResumeError('Job description is required')
  }

  try {
    // Retrieve the user's original resume
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    if (!user?.resume) {
      console.log(
        '%c [createCustomizedResume] No original resume found for user',
        'background: red; color: white'
      )
      throw new CustomResumeError(
        'No resume found. Please create a resume first.'
      )
    }

    console.log(
      '%c [createCustomizedResume] Original resume found:',
      'background: blue; color: white',
      user.resume
    )

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

    console.log(
      '%c [createCustomizedResume] Custom resume created in database:',
      'background: teal; color: white',
      customResume
    )

    return { success: true, data: customResume }
  } catch (error) {
    console.error('Failed to create custom resume:', error)
    console.error(
      '%c [createCustomizedResume] Failed to create custom resume:',
      'background: red; color: white',
      error
    )
    throw new CustomResumeError(
      error instanceof CustomResumeError
        ? error.message
        : 'Failed to create custom resume'
    )
  }
}
