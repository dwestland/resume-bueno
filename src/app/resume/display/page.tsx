import React from 'react'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { FileEdit, FileText } from 'lucide-react'

export default async function DisplayResumePage() {
  // Get the session using Next‑Auth v5's auth() (server side)
  const session = await auth()
  if (!session?.user?.email) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Resume Information
          </h1>
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
            <p className="text-amber-700">
              You are not authenticated. Please sign in to view your resume
              information.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Fetch the current user's resume fields
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      resume: true,
      education: true,
      certificates: true,
      experience: true,
      skills: true,
      projects: true,
      awards: true,
      training: true,
      volunteering: true,
      hobbies_interests: true,
    },
  })

  // Group fields for better organization
  const sections = [
    {
      title: 'Essential Information',
      fields: [{ name: 'Resume', value: user?.resume }],
    },
    {
      title: 'Background & Experience',
      fields: [
        { name: 'Education', value: user?.education },
        { name: 'Certificates', value: user?.certificates },
        { name: 'Experience', value: user?.experience },
      ],
    },
    {
      title: 'Skills & Achievements',
      fields: [
        { name: 'Skills', value: user?.skills },
        { name: 'Projects', value: user?.projects },
        { name: 'Awards', value: user?.awards },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        { name: 'Training', value: user?.training },
        { name: 'Volunteering', value: user?.volunteering },
        { name: 'Hobbies & Interests', value: user?.hobbies_interests },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-500" />
            Resume Information
          </h1>

          <Button asChild>
            <Link href="/resume/edit" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Edit Resume
            </Link>
          </Button>
        </div>

        <div className="prose prose-violet max-w-none mb-6">
          <p className="text-gray-600">
            This is your complete resume information. You can use this data to
            generate customized resumes and cover letters for specific job
            applications.
          </p>
        </div>

        {user ? (
          <div className="space-y-10">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-6">
                <div className="border-b border-gray-200 pb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {section.title}
                  </h2>
                </div>

                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <h3 className="text-base font-medium text-gray-700">
                      {field.name}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-line text-gray-700 min-h-[5rem] max-h-80 overflow-y-auto">
                      {field.value || 'Not available'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
            <p className="text-amber-700">
              No resume information found for your account.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
