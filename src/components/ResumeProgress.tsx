import Link from 'next/link'
import { Button } from '@/components/ui/button'

type ResumeProgressProps = {
  completionPercentage: number
}

export function ResumeProgress({ completionPercentage }: ResumeProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Resume Profile Completion
      </h3>

      <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {completionPercentage}% Complete
        </span>

        <Button
          variant="outline"
          size="sm"
          className="text-sm border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
        >
          <Link href="/resume/edit" className="flex items-center">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Complete Your Profile
          </Link>
        </Button>
      </div>
    </div>
  )
}
