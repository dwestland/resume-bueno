import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const session = await auth()
  if (!session?.user?.email) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Custom Resume History</h1>
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
      createdAt: true,
    },
  })

  // Fetch selected resume details if an ID is provided
  const selectedResume = searchParams.id
    ? await prisma.customResume.findFirst({
        where: {
          id: parseInt(searchParams.id),
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          job_description: true,
          job_evaluation: true,
          custom_resume: true,
          cover_letter: true,
        },
      })
    : null

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Custom Resume History</h1>

      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Left Column - Resume List */}
        <div className="w-1/3 min-w-[300px] overflow-y-auto rounded-lg">
          <div className="pr-2">
            {customResumes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No custom resumes found.</p>
                <Link
                  href="/custom-resume"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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
                    className={`block p-4 rounded-lg transition-colors ${
                      searchParams.id === resume.id.toString()
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white text-[#0a0a0a] hover:bg-gray-50'
                    }`}
                  >
                    <h2 className="font-semibold mb-1">
                      {resume.title || 'Untitled Resume'}
                    </h2>
                    <p className="text-sm text-gray-600">
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
              <div className="sticky top-0 bg-white pt-2 pb-4 mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedResume.title || 'Untitled Resume'}
                </h2>
                <p className="text-gray-600">
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
                  <h3 className="text-lg font-semibold mb-2">
                    Job Description
                  </h3>
                  <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
                    {selectedResume.job_description || 'Not available'}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">Job Evaluation</h3>
                  <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
                    {selectedResume.job_evaluation || 'Not available'}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">
                    Customized Resume
                  </h3>
                  <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
                    {selectedResume.custom_resume || 'Not available'}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                  <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
                    {selectedResume.cover_letter || 'Not available'}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg p-8">
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
