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
  jobDescription: string,
  additionalFields: {
    awards: string | null
    certificates: string | null
    education: string | null
    experience: string | null
    hobbies_interests: string | null
    projects: string | null
    skills: string | null
    training: string | null
    volunteering: string | null
  }
) {
  const startTime = Date.now()
  console.log('Starting resume suggestions generation...')

  try {
    const prompt = `Analyze this resume against the job description. First, extract and list ALL qualifications, technologies, skills, and keywords mentioned in BOTH documents. Pay close attention to all words in the resume no matter how insignificant before comparing it with the job description.

    RESUME:
    ${resume}
    
    JOB DESCRIPTION:
    ${jobDescription}

    ADDITIONAL QUALIFICATIONS:

    Education:
    ${additionalFields.education || 'Not provided'}

    Experience:
    ${additionalFields.experience || 'Not provided'}

    Skills:
    ${additionalFields.skills || 'Not provided'}

    Certificates:
    ${additionalFields.certificates || 'Not provided'}

    Projects:
    ${additionalFields.projects || 'Not provided'}

    Awards:
    ${additionalFields.awards || 'Not provided'}

    Training:
    ${additionalFields.training || 'Not provided'}

    Volunteering:
    ${additionalFields.volunteering || 'Not provided'}

    Hobbies & Interests:
    ${additionalFields.hobbies_interests || 'Not provided'}

    Take this RESUME and ADDITIONAL QUALIFICATIONS and match it against the JOB DESCRIPTION. Examine the ADDITIONAL QUALIFICATIONS very carefully to see if anything can be added to the resume to improve it.
    
    Then your response should ONLY include:
    Provide 3-5 high-impact suggestions formatted as:
    1. WHY: [explanation of how this change improves their chances]
       SUGGESTION: [exact text to copy/paste]
    
    Focus especially on:
    - Skills mentioned in the job description but understated in the resume
    - Experience that should be highlighted or rephrased
    - Using matching terminology from the job description`

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert resume writer who helps candidates optimize their resumes for specific job applications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    if (!completion.choices[0]?.message?.content) {
      throw new Error('Failed to generate suggestions')
    }

    const duration = Date.now() - startTime
    console.log(`Resume suggestions completed in ${duration}ms`)
    return completion.choices[0].message.content
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      'Error generating resume suggestions:',
      error,
      `(after ${duration}ms)`
    )
    throw new CustomResumeError('Failed to generate resume suggestions')
  }
}

async function generateCoverLetter(
  resume: string,
  jobDescription: string,
  date: string
) {
  const startTime = Date.now()
  console.log('Starting cover letter generation...')

  try {
    const prompt = `Write a compelling cover letter based on this resume and job description.

    DATE:
    ${date}

    RESUME:
    ${resume}

    JOB DESCRIPTION:
    ${jobDescription}

    Create a cover letter for this position in less than 220 words in a professional and terse style and demonstrates enthusiasm for the role. Use the provided DATE in the letter. Write a clear, concise, straightforward, short sentences of less than 80 characters in length. Avoid adverbs, and adverbial phrases. Write for a PPL of 10 and GLTR of 20. Use the provided DATE in the letter.`

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
  resume: string
) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Retrieve additional fields from the user's profile
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      awards: true,
      certificates: true,
      education: true,
      experience: true,
      hobbies_interests: true,
      projects: true,
      skills: true,
      training: true,
      volunteering: true,
    },
  })

  try {
    switch (step) {
      case 'evaluation':
        return await generateJobEvaluation(resume, jobDescription)
      case 'resume':
        return await generateCustomizedResume(
          resume,
          jobDescription,
          user || {
            awards: null,
            certificates: null,
            education: null,
            experience: null,
            hobbies_interests: null,
            projects: null,
            skills: null,
            training: null,
            volunteering: null,
          }
        )
      case 'cover_letter':
        return await generateCoverLetter(resume, jobDescription, today)
      case 'title':
        return await generateTitle(jobDescription)
      default:
        throw new Error('Invalid step')
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(
        error.status === 429
          ? 'Rate limit exceeded. Please try again later.'
          : `OpenAI API error: ${error.message}`
      )
    }
    throw error
  }
}

export type CustomResumeResponse = {
  success: boolean
  data: string
  credits?: number
  error?: string
  errorType?: 'INSUFFICIENT_CREDITS' | 'OTHER'
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
      return {
        success: false,
        data: '',
        error: 'Job description is required and must not be empty',
      }
    }
    jobDescription = formJobDescription.trim()
  } else {
    if (!input.job_description || !input.job_description.trim()) {
      return {
        success: false,
        data: '',
        error: 'Job description is required and must not be empty',
      }
    }
    jobDescription = input.job_description.trim()
  }

  const session = await auth()
  if (!session?.user?.email) {
    return {
      success: false,
      data: '',
      error: 'Not authenticated',
    }
  }

  try {
    // Check if user has enough credits when starting a new resume (evaluation step)
    if (step === 'evaluation') {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { credits: true },
      })

      if (!user || user.credits < 1) {
        return {
          success: false,
          data: '',
          error:
            'Insufficient credits. Please purchase more credits to continue.',
          errorType: 'INSUFFICIENT_CREDITS',
        }
      }
    }

    // Retrieve the user's original resume
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    if (!user?.resume) {
      return {
        success: false,
        data: '',
        error: 'No resume found. Please create a resume first.',
      }
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
    let result: string
    try {
      result = await generateStep(step, jobDescription, user.resume)
    } catch (error) {
      return {
        success: false,
        data: '',
        error:
          error instanceof Error ? error.message : 'Failed to generate content',
      }
    }

    // If this is the final step (title), save everything to the database
    if (step === 'title' && input instanceof FormData) {
      const evaluation = input.get('evaluation') as string
      const customResume = input.get('resume') as string
      const coverLetter = input.get('cover_letter') as string

      try {
        // Use a transaction to ensure both operations succeed or fail together
        const [, updatedUser] = await prisma.$transaction([
          prisma.customResume.create({
            data: {
              title: result,
              job_description: jobDescription,
              job_evaluation: evaluation,
              custom_resume: customResume,
              cover_letter: coverLetter,
              product_type: 'RESUME_PACKAGE',
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
      } catch (error) {
        return {
          success: false,
          data: '',
          error: `Failed to save custom resume: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        }
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Failed to create custom resume:', error)
    return {
      success: false,
      data: '',
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create custom resume',
    }
  }
}

// Helper function to generate the matching resume content
async function generateMatchingResume(
  jobDescription: string,
  userData: {
    resume?: string | null
    awards?: string | null
    certificates?: string | null
    education?: string | null
    experience?: string | null
    hobbies_interests?: string | null
    projects?: string | null
    skills?: string | null
    training?: string | null
    volunteering?: string | null
  }
): Promise<string> {
  if (!jobDescription) {
    throw new CustomResumeError('Job description is required')
  }

  if (!userData.resume) {
    throw new CustomResumeError('User resume data is required')
  }

  // Create a prompt for the matching resume
  const prompt = `
You are a professional resume writer who specializes in creating tailored resumes that match specific job descriptions.

JOB DESCRIPTION:
${jobDescription}

USER DATA:
${Object.entries(userData)
  .filter(([, value]) => value)
  .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
  .join('\n\n')}

INSTRUCTIONS:
1. Create a professionally formatted resume in markdown format tailored specifically for this job description.
2. Use the user's existing experience, skills, and other data but optimize it for this specific job.
3. Focus on highlighting the most relevant experiences and skills that match the job requirements.
4. The resume should be well-structured with clear sections for Summary, Experience, Education, Skills, and other relevant categories.
5. Use bullet points to highlight achievements and responsibilities.
6. Include only the most relevant information from the user data.
7. Format dates, job titles, and company names consistently.
8. Do not make up any information - only use what is provided.
9. Do not include any introduction or explanation text in your response, just the resume content in markdown.
10. The resume should be formatted to print well on a standard page.
11. Use proper markdown syntax:
   - Use # for main headings (e.g., # Summary)
   - Use ## for subheadings
   - Use **bold** for important text
   - Use * or - for bullet points
   - Use proper line breaks and spacing

Please create a tailored resume for this job position using the provided user data:
`

  try {
    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional resume writer who creates tailored resumes. Always use proper markdown formatting with headings (#, ##), bold text (**bold**), and bullet points (- or *). Ensure proper spacing and structure.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    })

    // Ensure the response is properly formatted markdown
    let content =
      completion.choices[0].message.content ||
      'Failed to generate matching resume.'

    // Make sure headings, bold text, and lists are properly formatted
    content = content.replace(/^(#+)\s*(.+)$/gm, '$1 $2') // Ensure space after # symbols
    content = content.replace(/\*\*(.+?)\*\*/g, '**$1**') // Ensure bold formatting

    return content
  } catch (error) {
    console.error('Error generating matching resume:', error)
    throw new CustomResumeError(
      'Failed to generate matching resume. Please try again later.'
    )
  }
}

export type ProductType = 'RESUME_PACKAGE' | 'MATCHING_RESUME'

// Server action to create a matching resume
export async function createMatchingResume(
  jobDescription: string,
  userEmail: string
): Promise<CustomResumeResponse> {
  try {
    // Fetch user data from the database
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
        credits: true,
        resume: true,
        awards: true,
        certificates: true,
        education: true,
        experience: true,
        hobbies_interests: true,
        projects: true,
        skills: true,
        training: true,
        volunteering: true,
      },
    })

    if (!user) {
      return {
        success: false,
        data: '',
        error: 'User not found',
      }
    }

    // Check if user has enough credits
    const REQUIRED_CREDITS = 1
    if (user.credits < REQUIRED_CREDITS) {
      return {
        success: false,
        data: '',
        error: 'Insufficient credits. Please purchase more credits.',
        errorType: 'INSUFFICIENT_CREDITS',
        credits: user.credits,
      }
    }

    // Generate the matching resume
    const matchingResume = await generateMatchingResume(jobDescription, {
      resume: user.resume,
      awards: user.awards,
      certificates: user.certificates,
      education: user.education,
      experience: user.experience,
      hobbies_interests: user.hobbies_interests,
      projects: user.projects,
      skills: user.skills,
      training: user.training,
      volunteering: user.volunteering,
    })

    // Generate a title for the matching resume
    const title = await generateTitle(jobDescription)

    // Update user credits
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        credits: user.credits - REQUIRED_CREDITS,
      },
    })

    // Save the custom resume to the database
    await prisma.customResume.create({
      data: {
        job_description: jobDescription,
        matching_resume: matchingResume,
        title: title,
        product_type: 'MATCHING_RESUME',
        users: {
          create: [
            {
              userId: user.id,
            },
          ],
        },
      },
    })

    return {
      success: true,
      data: matchingResume,
      credits: updatedUser.credits,
    }
  } catch (error) {
    console.error('Error creating matching resume:', error)
    return {
      success: false,
      data: '',
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      errorType: 'OTHER',
    }
  }
}
