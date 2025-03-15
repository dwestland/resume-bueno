import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { ComponentPropsWithoutRef } from 'react'
import { CopyButton } from '@/components/CopyButton'

type Props = {
  searchParams: Promise<{ id?: string }>
}

// Custom components for ReactMarkdown to control spacing
const components = {
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p className="my-2" {...props}>
      {children}
    </p>
  ),
  // Add other custom components as needed
}

// Helper function to process markdown content
const processContent = (content: string | null): string => {
  if (!content) return 'Not available'

  // Replace multiple line breaks with a single one
  return content.replace(/\n{2,}/g, '\n').trim()
}

export default async function HistoryPage({ searchParams }: Props) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user?.email) {
    return (
      <div className="p-6 mx-auto max-w-7xl">
        <h1>Custom Resume History</h1>
        <p>Please sign in to view your custom resume history.</p>
      </div>
    )
  }

  // Fetch user's custom resumes for the list
  const customResumes = await prisma.customResume.findMany({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      product_type: true,
      createdAt: true,
    },
  })

  // Safely parse and validate the ID parameter
  let selectedResume = null
  if (params?.id) {
    const parsedId = parseInt(params.id)
    if (!isNaN(parsedId)) {
      selectedResume = await prisma.customResume.findFirst({
        where: {
          id: parsedId,
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
          product_type: true,
          createdAt: true,
          job_description: true,
          job_evaluation: true,
          custom_resume: true,
          cover_letter: true,
          matching_resume: true,
        },
      })
    }
  }

  // Helper function to format product type for display
  const formatProductType = (type: string | null) => {
    if (!type) return ''
    return type === 'RESUME_PACKAGE' ? 'Resume Package' : 'Matching Resume'
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-10">
        Custom Resume History
      </h1>
      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Left Column - Resume List */}
        <div className="w-1/3 min-w-[300px] overflow-y-auto rounded-lg">
          <div className="pr-2">
            {customResumes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-gray-600">No custom resumes found.</p>
                <Link
                  href="/custom-resume"
                  className="inline-block px-4 py-2 text-white transition-colors bg-blue-500 rounded hover:bg-blue-600"
                >
                  Create Your First Custom Resume
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {customResumes.map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/history?id=${resume.id}`}
                    className={`block py-0 px-4 rounded-lg    transition-colors ${
                      params?.id === resume.id.toString()
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white text-[#0a0a0a] hover:bg-gray-50'
                    }`}
                  >
                    <p className="mb-1 text-base font-semibold">
                      {resume.title || 'Untitled Resume'}
                    </p>
                    {resume.product_type && (
                      <p className="my-1 text-sm font-medium text-teal-600 mb-1">
                        {formatProductType(resume.product_type)}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(resume.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Resume Details */}
        <div className="flex-1 overflow-y-auto rounded-lg">
          {selectedResume ? (
            <div className="bg-white text-[#0a0a0a] p-6 rounded-lg shadow">
              <div className="sticky top-0 pt-2 pb-4 mb-4 bg-white">
                <h2 className="text-2xl font-bold mb-1">
                  {selectedResume.title || 'Untitled Resume'}
                </h2>
                {selectedResume.product_type && (
                  <p className="text-sm font-medium text-primary my-1">
                    {formatProductType(selectedResume.product_type)}
                  </p>
                )}
                <p className="text-gray-600 mt-1">
                  Created on{' '}
                  {new Date(selectedResume.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>

              <div className="space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-semibold text-teal-700">
                      Job Description
                    </h3>
                    {selectedResume.job_description && (
                      <CopyButton
                        content={selectedResume.job_description}
                        label="Copy Job Description"
                      />
                    )}
                  </div>
                  <div className="p-4 overflow-y-auto rounded max-h-60 bg-gray-50">
                    <ReactMarkdown components={components}>
                      {processContent(selectedResume.job_description)}
                    </ReactMarkdown>
                  </div>
                </section>

                {/* Show appropriate content based on product type */}
                {selectedResume.product_type === 'RESUME_PACKAGE' ? (
                  <>
                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-teal-700">
                          Job Evaluation
                        </h3>
                        {selectedResume.job_evaluation && (
                          <CopyButton
                            content={selectedResume.job_evaluation}
                            label="Copy Evaluation"
                          />
                        )}
                      </div>
                      <div className="p-4 overflow-y-auto rounded max-h-60 bg-gray-50">
                        <ReactMarkdown components={components}>
                          {processContent(selectedResume.job_evaluation)}
                        </ReactMarkdown>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-teal-700">
                          Resume Improvement Suggestions
                        </h3>
                        {selectedResume.custom_resume && (
                          <CopyButton
                            content={selectedResume.custom_resume}
                            label="Copy Suggestions"
                          />
                        )}
                      </div>
                      <div className="p-4 overflow-y-auto rounded max-h-60 bg-gray-50">
                        <ReactMarkdown components={components}>
                          {processContent(selectedResume.custom_resume)}
                        </ReactMarkdown>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-semibold text-teal-700">
                          Cover Letter
                        </h3>
                        {selectedResume.cover_letter && (
                          <CopyButton
                            content={selectedResume.cover_letter}
                            label="Copy Cover Letter"
                          />
                        )}
                      </div>
                      <div className="p-4 overflow-y-auto rounded max-h-60 bg-gray-50">
                        <ReactMarkdown components={components}>
                          {processContent(selectedResume.cover_letter)}
                        </ReactMarkdown>
                      </div>
                    </section>
                  </>
                ) : (
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-semibold text-teal-700">
                        Matching Resume
                      </h3>
                      {selectedResume.matching_resume && (
                        <CopyButton
                          content={selectedResume.matching_resume}
                          label="Copy Resume"
                        />
                      )}
                    </div>
                    <div className="p-4 overflow-y-auto rounded bg-gray-50">
                      <div className="prose prose-gray prose-headings:text-gray-800 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-li:my-0 max-w-none overflow-auto">
                        <ReactMarkdown components={components}>
                          {processContent(selectedResume.matching_resume)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-8 rounded-lg bg-gray-50">
              <p className="text-gray-500">
                Select a resume from the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
