'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
// Import pdf-parse for PDF parsing (only runs on the server)
import pdfParse from 'pdf-parse'
// Import mammoth for DOCX parsing
import mammoth from 'mammoth'

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
      // Replace multiple spaces with a single space
      .replace(/ {2,}/g, ' ')
      // Remove excessive indentation at the start of lines
      .replace(/^[ \t]+(.+)/gm, '$1')
      // Preserve paragraph breaks
      .replace(/\n\s*\n/g, '\n\n')
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

    const fileName = file.name.toLowerCase()
    const fileType = file.type
    const buffer = await file.arrayBuffer()

    // Determine file type by both MIME type and extension
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
    const isDocx =
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')

    // If it's a PDF, convert it to markdown
    if (isPdf) {
      console.log('Processing PDF file')
      const markdown = await convertPdfToMarkdown(Buffer.from(buffer))
      return { content: markdown, success: true }
    }
    // If it's a DOCX, use mammoth to extract text
    else if (isDocx) {
      console.log('Processing DOCX file')
      try {
        // Convert ArrayBuffer to Buffer for mammoth to process correctly
        const docxBuffer = Buffer.from(buffer)

        // Use mammoth to convert DOCX to text
        const result = await mammoth.extractRawText({
          buffer: docxBuffer, // Use 'buffer' option instead of 'arrayBuffer'
        })

        let text = result.value || ''

        // Apply common text cleanup
        text = cleanupResumeText(text)

        // Keep the structure but remove Markdown formatting
        let formattedText = text
          // Preserve list structure but don't add Markdown syntax
          .replace(/^(\d+)[\.\)]\s+(.+)/gm, '$1. $2')
          .replace(/^[•\-\*]\s+(.+)/gm, '• $1')
          // Preserve job titles and companies without bold markdown
          // Preserve dates without italic markdown
          // Format phone numbers and emails for better visibility
          .replace(
            /\b(\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})\b/g,
            'Phone: $1'
          )
          .replace(
            /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
            'Email: $1'
          )

        // Add proper section headers if they don't exist, but in plain text
        if (
          !formattedText.includes('EXPERIENCE') &&
          !formattedText.match(/WORK\s+EXPERIENCE/i)
        ) {
          // Look for patterns that suggest job experience entries
          const experiencePattern =
            /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-]+\d{4})\s+(?:to|-)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-]+\d{4}|Present)/i

          if (experiencePattern.test(formattedText)) {
            // Insert a header before the first match, as plain text
            formattedText = formattedText.replace(
              experiencePattern,
              'EXPERIENCE\n\n$&'
            )
          }
        }

        // Add a summary section if it doesn't exist, as plain text
        if (
          !formattedText.includes('SUMMARY') &&
          !formattedText.includes('PROFILE')
        ) {
          const firstParagraphMatch = formattedText.match(/^(.+\n\n)/)
          if (firstParagraphMatch && firstParagraphMatch[1].length > 100) {
            formattedText = formattedText.replace(
              firstParagraphMatch[0],
              'SUMMARY\n\n' + firstParagraphMatch[0]
            )
          }
        }

        console.log('DOCX successfully converted to plain text')
        return { content: formattedText, success: true }
      } catch (docxError) {
        console.error('Error processing DOCX with mammoth:', docxError)
        throw new Error('Failed to process DOCX file')
      }
    }

    // For other file types, convert the ArrayBuffer to text
    const content = await new Response(buffer).text()
    return { content, success: true }
  } catch (error) {
    console.error('Error processing resume file:', error)
    return {
      content:
        'Failed to process file. Please try copying and pasting your resume content instead.',
      success: false,
    }
  }
}

// New server action to convert PDF to plain text (renamed function)
export async function convertPdfToMarkdown(pdfBuffer: Buffer): Promise<string> {
  try {
    // Parse the PDF file
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
