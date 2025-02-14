import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import EditResumeForm from './EditResumeForm'

export default async function EditResumePage() {
  const session = await auth()
  if (!session?.user?.email) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Resume</h1>
        <p>Please sign in to edit your resume.</p>
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Resume</h1>
      <EditResumeForm defaultValues={defaultValues} />
    </div>
  )
}
