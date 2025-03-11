import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import EditResumeForm from './EditResumeForm'
import { Pencil } from 'lucide-react'

export default async function EditResumePage() {
  const session = await auth()
  if (!session?.user?.email) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Edit Resume</h1>
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
            <p className="text-amber-700">
              Please sign in to edit your resume.
            </p>
          </div>
        </div>
      </div>
    )
  }

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

  // Added to stop defaultValues from giving a TS error
  // Not sure what this doing
  // Convert null values to empty strings
  const defaultValues = {
    resume: user?.resume ?? '',
    education: user?.education ?? '',
    certificates: user?.certificates ?? '',
    experience: user?.experience ?? '',
    skills: user?.skills ?? '',
    projects: user?.projects ?? '',
    awards: user?.awards ?? '',
    training: user?.training ?? '',
    volunteering: user?.volunteering ?? '',
    hobbies_interests: user?.hobbies_interests ?? '',
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Pencil className="h-6 w-6 text-teal-500" />
            Edit Resume
          </h1>
        </div>
        <div className="prose prose-violet max-w-none mb-6">
          <p className="text-gray-600">
            Update your resume information below. This information will be used
            to generate customized resumes and cover letters that match specific
            job descriptions.
          </p>
        </div>
        <EditResumeForm defaultValues={defaultValues} />
      </div>
    </div>
  )
}
