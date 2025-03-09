'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Common text cleanup function to use for both PDF and DOCX
function cleanupResumeText(text: string): string {
  return (
    text
      // Remove leading and trailing whitespace
      .trim()
      // Remove multiple consecutive empty lines at the beginning
      .replace(/^(\s*\n)+/, '')
      // Convert multiple consecutive empty lines to just double line breaks throughout the document
      .replace(/\n{3,}/g, '\n\n')
      // Replace multiple spaces with a single space (but preserve line breaks)
      .replace(/[^\S\n]+/g, ' ')
      // Remove spaces at the beginning of lines
      .replace(/^\s+/gm, '')
      // Remove spaces at the end of lines
      .replace(/\s+$/gm, '')
  )
}

// New server action to process uploaded resume files
export async function processResumeFile(
  formData: FormData
): Promise<{ content: string; success: boolean }> {
  try {
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file uploaded')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.toLowerCase()

    let text = ''
    if (fileName.endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      text = data.text
    } else if (fileName.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      throw new Error('Unsupported file type')
    }

    return {
      content: cleanupResumeText(text),
      success: true,
    }
  } catch (error) {
    console.error('Error processing resume file:', error)
    return {
      content: '',
      success: false,
    }
  }
}

// New server action to convert PDF to plain text (renamed function)
export async function convertPdfToMarkdown(pdfBuffer: Buffer): Promise<string> {
  try {
    // Parse the PDF file
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(pdfBuffer)
    let text = data.text || ''

    // Apply common text cleanup
    text = cleanupResumeText(text)

    // Basic text formatting without Markdown
    const formattedText = text
      // Preserve lines that look like headings but don't add Markdown
      .replace(/^(.+)[\r\n]+([=-]{2,})[\r\n]+/gm, (_, p1) => `${p1}\n\n`)
      // Preserve list structure
      .replace(/^(\d+)[\.\)]\s+(.+)/gm, '$1. $2')
      // Convert lines that start with bullets to consistent bullet format
      .replace(/^[•\-\*]\s+(.+)/gm, '• $1')

    return formattedText
  } catch (error) {
    console.error('Error converting PDF to text:', error)
    throw new Error('Failed to process PDF file')
  }
}

export async function updateResume(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  const data = {
    resume: formData.get('resume') as string,
    education: formData.get('education') as string,
    certificates: formData.get('certificates') as string,
    experience: formData.get('experience') as string,
    skills: formData.get('skills') as string,
    projects: formData.get('projects') as string,
    awards: formData.get('awards') as string,
    training: formData.get('training') as string,
    volunteering: formData.get('volunteering') as string,
    hobbies_interests: formData.get('hobbies_interests') as string,
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data,
    })
    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Failed to update resume:', error)
    throw new Error('Failed to update resume')
  }
}

export async function checkUserResume() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    return user?.resume ? true : false
  } catch (error) {
    console.error('Error checking user resume:', error)
    return null
  }
}

export async function getResumeProgress() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
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

    if (!user) return null

    // Count completed fields (non-null values)
    const fields = [
      'resume',
      'awards',
      'certificates',
      'education',
      'experience',
      'hobbies_interests',
      'projects',
      'skills',
      'training',
      'volunteering',
    ]

    const completedFields = fields.filter(
      (field) => !!user[field as keyof typeof user]
    )
    const completionPercentage = Math.round(
      (completedFields.length / fields.length) * 100
    )

    return {
      fields: user,
      completedCount: completedFields.length,
      totalFields: fields.length,
      completionPercentage,
    }
  } catch (error) {
    console.error('Error fetching resume progress:', error)
    return null
  }
}

export async function updateResumeData(formData: {
  resume: string
  education?: string
  certificates?: string
  experience?: string
  skills?: string
  projects?: string
  awards?: string
  training?: string
  volunteering?: string
  hobbies_interests?: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      throw new Error('Not authenticated')
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        resume: formData.resume,
        education: formData.education,
        certificates: formData.certificates,
        experience: formData.experience,
        skills: formData.skills,
        projects: formData.projects,
        awards: formData.awards,
        training: formData.training,
        volunteering: formData.volunteering,
        hobbies_interests: formData.hobbies_interests,
      },
    })

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Error updating resume:', error)
    return { success: false, error: 'Failed to update resume' }
  }
}
