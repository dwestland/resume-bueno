import Link from 'next/link'
import { Button } from '@/components/ui/button'

type ResumeField =
  | 'resume'
  | 'awards'
  | 'certificates'
  | 'education'
  | 'experience'
  | 'hobbies_interests'
  | 'projects'
  | 'skills'
  | 'training'
  | 'volunteering'

type ResumeProgressProps = {
  completedCount: number
  totalFields: number
  completionPercentage: number
  fields?: Record<ResumeField, unknown>
}

// Map of field names to display names
const fieldDisplayNames: Record<ResumeField, string> = {
  resume: 'Basic Information',
  awards: 'Awards & Recognitions',
  certificates: 'Certifications',
  education: 'Education History',
  experience: 'Work Experience',
  hobbies_interests: 'Hobbies & Interests',
  projects: 'Projects',
  skills: 'Skills',
  training: 'Training',
  volunteering: 'Volunteering',
}

export function ResumeProgress({
  completedCount,
  totalFields,
  completionPercentage,
  fields,
}: ResumeProgressProps) {
  // Determine if we should show detailed breakdown
  const showDetails = completionPercentage > 0 && completionPercentage < 100

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Resume Profile Completion
          </h3>
          <p className="text-sm text-gray-500">
            Complete your resume profile to unlock all features
          </p>
        </div>
        <div className="bg-violet-50 px-3 py-1.5 rounded-full text-violet-800 text-sm font-medium">
          {completedCount} of {totalFields} sections
        </div>
      </div>

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

        {completionPercentage < 100 && (
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
        )}

        {completionPercentage === 100 && (
          <div className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full flex items-center">
            <svg
              className="w-4 h-4 mr-1"
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
            Complete!
          </div>
        )}
      </div>

      {/* Show detailed section breakdown if profile is partially complete */}
      {showDetails && fields && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Section Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(fieldDisplayNames).map(([key, displayName]) => {
              const isComplete = !!fields[key as ResumeField]
              return (
                <div key={key} className="flex items-center text-sm">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                      isComplete
                        ? 'bg-teal-100 text-teal-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isComplete ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={isComplete ? 'text-gray-800' : 'text-gray-500'}
                  >
                    {displayName}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {completionPercentage < 50 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-amber-800">
            A complete profile helps our AI generate better tailored resumes and
            cover letters for your job applications.
          </p>
        </div>
      )}
    </div>
  )
}
