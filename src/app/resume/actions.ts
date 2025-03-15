'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
// Import pdf2json for PDF parsing (runs on server)
import PDFParser from 'pdf2json'
// Import mammoth for DOCX parsing
import mammoth from 'mammoth'

/**
 * Error class for file processing failures
 */
class FileProcessingError extends Error {
  public readonly code: string
  public readonly originalError?: Error

  constructor(message: string, code: string, originalError?: Error) {
    super(message)
    this.name = 'FileProcessingError'
    this.code = code
    this.originalError = originalError

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileProcessingError)
    }
  }
}

/**
 * Shared text cleanup function for both PDF and DOCX
 * Formats and normalizes extracted text while preserving line breaks
 */
function cleanupResumeText(text: string): string {
  if (!text) return ''

  return (
    text
      // Remove leading and trailing whitespace
      .trim()
      // Remove multiple consecutive empty lines at the beginning
      .replace(/^(\s*\n)+/, '')
      // Convert more than 3 consecutive line breaks to just double line breaks
      .replace(/\n{4,}/g, '\n\n\n')
      // Replace multiple consecutive spaces with a single space, but preserve line breaks
      .replace(/ {2,}/g, ' ')
      // Remove excessive indentation at the start of lines but keep the line structure
      .replace(/^[ \t]+(.+)/gm, '$1')
      // Fix broken words that may have been split across lines
      .replace(/(\w)-\n(\w)/g, '$1$2')
      // Preserve dash-based bullet points
      .replace(/^ *[-•] */gm, '• ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize Unicode whitespace while preserving line breaks
      .replace(
        /[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g,
        ' '
      )
      // Ensure no more than 3 consecutive line breaks anywhere
      .replace(/\n{4,}/g, '\n\n\n')
  )
}

/**
 * Enhanced text formatting for resumes
 * Improves structure and readability while preserving original line breaks
 */
function formatResumeText(text: string): string {
  if (!text) return ''

  return (
    text
      // Preserve list structure without changing line breaks
      .replace(/^(\d+)[\.\)]\s+(.+)/gm, '$1. $2')
      // Consistent bullet formatting without changing line breaks
      .replace(/^[•\-\*]\s+(.+)/gm, '• $1')
      // Format contact information, preserving original line breaks
      // Format phone numbers for better visibility
      .replace(
        /\b(\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})\b/g,
        'Phone: $1'
      )
      // Format email addresses
      .replace(
        /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
        'Email: $1'
      )
      // Format URLs for better visibility (without breaking them)
      .replace(/(https?:\/\/[^\s]+)/g, 'Website: $1')
      // Ensure section headers are consistently formatted (uppercase)
      .replace(
        /^(experience|education|skills|summary|profile|certifications|certificates|projects|awards|training|volunteering|hobbies|interests)[\s\:]*$/gim,
        (match) => match.toUpperCase()
      )
      // Preserve consecutive line breaks for section breaks (up to 3 consecutive)
      .replace(/\n{4,}/g, '\n\n\n')
  )
}

/**
 * Process a resume file (PDF or DOCX)
 * @param formData The form data containing the file
 * @returns Object with extracted content and success status
 */
export async function processResumeFile(
  formData: FormData
): Promise<{ content: string; success: boolean; error?: string }> {
  try {
    const file = formData.get('file') as File

    if (!file) {
      throw new FileProcessingError('No file uploaded', 'NO_FILE')
    }

    // Get file info
    const fileName = file.name.toLowerCase()
    const fileType = file.type
    const fileSize = file.size

    // Check file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (fileSize > MAX_FILE_SIZE) {
      throw new FileProcessingError(
        'File size exceeds the 10MB limit',
        'FILE_TOO_LARGE'
      )
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Determine file type by MIME type and extension
    const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf')
    const isDocx =
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')

    // Process based on file type
    if (isPdf) {
      console.log('Processing PDF file:', fileName)
      const extractedText = await extractTextFromPdf(Buffer.from(buffer))
      return { content: extractedText, success: true }
    } else if (isDocx) {
      console.log('Processing DOCX file:', fileName)
      const extractedText = await extractTextFromDocx(Buffer.from(buffer))
      return { content: extractedText, success: true }
    } else {
      throw new FileProcessingError(
        'Unsupported file type. Please upload a PDF or DOCX file',
        'UNSUPPORTED_FILE_TYPE'
      )
    }
  } catch (error) {
    console.error('Error processing resume file:', error)

    // Format error message based on error type
    if (error instanceof FileProcessingError) {
      return {
        content: '',
        success: false,
        error: error.message,
      }
    }

    return {
      content: '',
      success: false,
      error:
        'Failed to process file. Please try copying and pasting your resume content instead.',
    }
  }
}

/**
 * Extract text from PDF using pdf2json
 * @param pdfBuffer Buffer containing PDF data
 * @returns Formatted text content
 */
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser()

      // Set up event handlers
      pdfParser.on('pdfParser_dataError', (errData) => {
        console.error('PDF parsing error:', errData)
        reject(
          new FileProcessingError(
            'Error parsing PDF file',
            'PDF_PARSE_ERROR',
            new Error(
              errData.parserError?.toString() || 'Unknown PDF parsing error'
            )
          )
        )
      })

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          let extractedText = ''

          // Process each page
          if (pdfData && pdfData.Pages && pdfData.Pages.length > 0) {
            let lastY = -1 // Track Y position for line breaks
            let lastX = -1 // Track X position for potential horizontal breaks

            for (const page of pdfData.Pages) {
              // Process each text element on the page
              if (page.Texts && page.Texts.length > 0) {
                // Sort texts by Y position (top to bottom) then by X position (left to right)
                const sortedTexts = [...page.Texts].sort((a, b) => {
                  if (a.y !== b.y) return a.y - b.y
                  return a.x - b.x
                })

                for (const textElement of sortedTexts) {
                  // Check if we need to add a new line based on Y position change
                  if (lastY !== -1 && textElement.y > lastY + 0.2) {
                    // Significant Y position change indicates a new line
                    extractedText += '\n'

                    // If the Y change is larger, add an extra line break for paragraph
                    if (textElement.y > lastY + 1) {
                      extractedText += '\n'
                    }
                  } else if (
                    lastX !== -1 &&
                    textElement.x < lastX &&
                    textElement.y > lastY
                  ) {
                    // If X position goes back to left but Y increased slightly, it's a new line
                    extractedText += '\n'
                  }

                  // Extract and decode the text
                  if (textElement.R && textElement.R.length > 0) {
                    for (const textFragment of textElement.R) {
                      if (textFragment.T) {
                        // Decode the URI-encoded text
                        const decodedText = decodeURIComponent(textFragment.T)
                        extractedText += decodedText + ' '
                      }
                    }
                  }

                  // Update last positions
                  lastY = textElement.y
                  lastX = textElement.x
                }

                // Add page break between pages
                extractedText += '\n\n'
              }
            }
          }

          // Clean up and format the extracted text
          const cleanedText = cleanupResumeText(extractedText)
          const formattedText = formatResumeText(cleanedText)

          resolve(formattedText || '')
        } catch (processingError) {
          console.error('Error processing PDF data:', processingError)
          reject(
            new FileProcessingError(
              'Error processing PDF content',
              'PDF_PROCESSING_ERROR',
              processingError instanceof Error
                ? processingError
                : new Error(String(processingError))
            )
          )
        }
      })

      // Start parsing
      pdfParser.parseBuffer(pdfBuffer)
    } catch (error) {
      console.error('PDF parser initialization error:', error)
      reject(
        new FileProcessingError(
          'Failed to initialize PDF parser',
          'PDF_PARSER_INIT_ERROR',
          error instanceof Error ? error : new Error(String(error))
        )
      )
    }
  })
}

/**
 * Extract text from DOCX using mammoth
 * @param docxBuffer Buffer containing DOCX data
 * @returns Formatted text content
 */
async function extractTextFromDocx(docxBuffer: Buffer): Promise<string> {
  try {
    // Use mammoth to convert DOCX to text
    const result = await mammoth.extractRawText({
      buffer: docxBuffer,
    })

    const text = result.value || ''

    // Clean up and format the extracted text
    const cleanedText = cleanupResumeText(text)
    const formattedText = formatResumeText(cleanedText)

    // Add section headers if they don't exist
    let enhancedText = formattedText

    // Add EXPERIENCE section if not present but date patterns suggest job experience
    if (
      !enhancedText.includes('EXPERIENCE') &&
      !enhancedText.match(/WORK\s+EXPERIENCE/i)
    ) {
      const experiencePattern =
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-]+\d{4})\s+(?:to|-)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\.\-]+\d{4}|Present)/i

      if (experiencePattern.test(enhancedText)) {
        enhancedText = enhancedText.replace(
          experiencePattern,
          'EXPERIENCE\n\n$&'
        )
      }
    }

    // Add SUMMARY section if not present but there's a substantial first paragraph
    if (
      !enhancedText.includes('SUMMARY') &&
      !enhancedText.includes('PROFILE')
    ) {
      const firstParagraphMatch = enhancedText.match(/^(.+\n\n)/)
      if (firstParagraphMatch && firstParagraphMatch[1].length > 100) {
        enhancedText = enhancedText.replace(
          firstParagraphMatch[0],
          'SUMMARY\n\n' + firstParagraphMatch[0]
        )
      }
    }

    return enhancedText
  } catch (error) {
    console.error('Error processing DOCX with mammoth:', error)
    throw new FileProcessingError(
      'Failed to process DOCX file',
      'DOCX_PROCESSING_ERROR',
      error instanceof Error ? error : new Error(String(error))
    )
  }
}

/**
 * Update user's resume data in the database
 */
export async function updateResume(formData: FormData) {
  try {
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

    // Filter out empty fields to avoid overwriting with empty strings
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined && value !== null
      )
    )

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: filteredData,
    })

    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Failed to update resume:', error)
    throw new Error('Failed to update resume')
  }
}

/**
 * Check if user has a resume already
 */
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

/**
 * Get user's resume completion progress
 */
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

    // Count completed fields (non-null and non-empty values)
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

    const completedFields = fields.filter((field) => {
      const value = user[field as keyof typeof user]
      return value && typeof value === 'string' && value.trim() !== ''
    })

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
