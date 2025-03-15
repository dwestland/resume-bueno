'use client'

import { useState } from 'react'

interface CopyButtonProps {
  content: string
  label?: string
  className?: string
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

export function CopyButton({
  content,
  label = 'Copy',
  className = '',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!content) return

    try {
      // Convert markdown to plain text before copying
      const plainText = markdownToPlainText(content)
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy content to clipboard:', err)
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors ${className}`}
      title="Copy as plain text"
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
      {copied ? 'Copied!' : label}
    </button>
  )
}
