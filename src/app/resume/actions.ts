'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
// Import pdf-parse for PDF parsing (only runs on the server)
import pdfParse from 'pdf-parse'

// New server action to process uploaded resume files
export async function processResumeFile(
  formData: FormData
): Promise<{ content: string; success: boolean }> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      throw new Error('No file uploaded')
    }

    const fileType = file.type
    const buffer = await file.arrayBuffer()

    // If it's a PDF, convert it to markdown
    if (fileType === 'application/pdf') {
      const markdown = await convertPdfToMarkdown(Buffer.from(buffer))
      return { content: markdown, success: true }
    }

    // For other file types, convert the ArrayBuffer to text
    const content = await new Response(buffer).text()
    return { content, success: true }
  } catch (error) {
    console.error('Error processing resume file:', error)
    return { content: '', success: false }
  }
}

// New server action to convert PDF to markdown
export async function convertPdfToMarkdown(pdfBuffer: Buffer): Promise<string> {
  try {
    // Parse the PDF file
    const data = await pdfParse(pdfBuffer)
    const text = data.text || ''

    // Basic markdown formatting
    const markdown = text
      // Preserve paragraph breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Convert lines that look like headings
      .replace(/^(.+)[\r\n]+([=-]{2,})[\r\n]+/gm, (_, p1, p2) =>
        p2[0] === '=' ? `# ${p1}\n\n` : `## ${p1}\n\n`
      )
      // Convert lines that start with numbers to list items
      .replace(/^(\d+)[\.\)]\s+(.+)/gm, '$1. $2')
      // Convert lines that start with bullets to list items
      .replace(/^[•\-\*]\s+(.+)/gm, '- $1')

    return markdown
  } catch (error) {
    console.error('Error converting PDF to markdown:', error)
    throw new Error('Failed to convert PDF to markdown')
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
