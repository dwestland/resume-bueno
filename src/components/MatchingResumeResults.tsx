'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MatchingResumeResultsProps {
  matchingResume: string | null
  isGenerating: boolean
}

// Helper function to convert markdown to plain text
const markdownToPlainText = (markdown: string): string => {
  if (!markdown) return ''

  return (
    markdown
      // Replace headers
      .replace(/#{1,6}\s+/g, '')
      // Replace bold and italic
      .replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, '$1')
      // Replace links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Replace code blocks with their content
      .replace(/```[a-z]*\n([\s\S]*?)```/g, '$1')
      // Replace inline code
      .replace(/`([^`]+)`/g, '$1')
      // Replace block quotes
      .replace(/^\s*>\s+/gm, '')
      // Replace ordered and unordered lists but keep the text
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Replace horizontal rules
      .replace(/^\s*[-*_]{3,}\s*$/gm, '\n')
      // Remove extra line breaks
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

export default function MatchingResumeResults({
  matchingResume,
  isGenerating,
}: MatchingResumeResultsProps) {
  const [copied, setCopied] = useState(false)

  // Function to copy matching resume to clipboard
  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!matchingResume) return

    try {
      // Convert markdown to plain text before copying
      const plainText = markdownToPlainText(matchingResume)
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy resume to clipboard:', err)
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isGenerating ? 'border-blue-300 border-2' : 'border border-gray-200'
        }`}
      >
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-1 rounded-full bg-blue-100 mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Matching Resume
            </h3>
          </div>

          {/* Copy to Clipboard Button - Only visible when content is available */}
          {matchingResume && !isGenerating && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Copy resume as plain text"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    copied
                      ? 'M5 13l4 4L19 7' // Checkmark icon when copied
                      : 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002 2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                  }
                />
              </svg>
              {copied ? 'Copied!' : 'Copy Plain Text'}
            </button>
          )}
        </div>

        <div className="p-6">
          {isGenerating && !matchingResume ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center space-x-3 mb-4">
                <svg
                  className="w-8 h-8 text-blue-500 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg font-medium text-gray-700">
                  Creating your tailored resume...
                </span>
              </div>
              <p className="text-gray-500 text-center max-w-md">
                We&apos;re analyzing the job description and crafting a
                perfectly tailored resume for this position.
              </p>
            </div>
          ) : matchingResume ? (
            <div className="prose prose-gray prose-headings:text-gray-800 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-800 prose-ul:text-gray-700 prose-li:my-0 max-w-none overflow-auto bg-white text-gray-800">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="text-2xl font-bold text-gray-900 mb-4 mt-6"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="text-xl font-bold text-gray-800 mt-6 mb-3"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3
                      className="text-lg font-semibold text-gray-800 mt-5 mb-2"
                      {...props}
                    />
                  ),
                  ul: ({ ...props }) => (
                    <ul
                      className="list-disc pl-6 mb-4 space-y-1 text-gray-700"
                      {...props}
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="list-decimal pl-6 mb-4 space-y-1 text-gray-700"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => (
                    <li className="text-gray-700 my-1" {...props} />
                  ),
                  strong: ({ ...props }) => (
                    <strong
                      className="font-semibold text-gray-800"
                      {...props}
                    />
                  ),
                  p: ({ ...props }) => (
                    <p className="text-gray-700 mb-4" {...props} />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="pl-4 italic border-l-4 border-gray-300 my-4"
                      {...props}
                    />
                  ),
                  pre: ({ ...props }) => (
                    <pre
                      className="bg-gray-100 rounded-md p-3 text-gray-800 my-4 whitespace-pre-wrap overflow-auto"
                      {...props}
                    />
                  ),
                  code: ({ ...props }) => (
                    <code
                      className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono text-sm"
                      {...props}
                    />
                  ),
                }}
              >
                {matchingResume}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>
      </div>

      {matchingResume && !isGenerating && (
        <div className="bg-green-50 rounded-lg px-6 py-5 border border-green-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Generation Complete
              </h3>
              <div className="mt-1 text-sm text-green-700">
                Your tailored resume is ready! You can copy and use it for your
                application.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
