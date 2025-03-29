'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { DeleteResumeDialog } from './DeleteResumeDialog'

interface ResumeListItemProps {
  resume: {
    id: number
    title: string | null
    product_type: string | null
    createdAt: Date
  }
  isSelected: boolean
}

function formatProductType(type: string | null) {
  if (!type) return ''
  return type === 'RESUME_PACKAGE' ? 'Resume Package' : 'Matching Resume'
}

export function ResumeListItem({ resume, isSelected }: ResumeListItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="relative">
      <Link
        href={`/history?id=${resume.id}`}
        className={`block py-3 px-4 rounded-lg transition-colors ${
          isSelected
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-white text-[#0a0a0a] hover:bg-gray-50'
        }`}
      >
        <p className="mb-1 text-base font-semibold pr-5">
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

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDialogOpen(true)
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Delete resume"
      >
        <X className="h-3.5 w-3.5 text-gray-500" />
      </button>

      <DeleteResumeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resumeId={resume.id}
        resumeTitle={resume.title || 'Untitled Resume'}
      />
    </div>
  )
}
