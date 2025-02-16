'use server'
import { auth } from '@/auth'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const session = await auth()

  if (session?.user && session.user.email) {
    // Fetch the user's resume field and credits
    const userRecord = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        resume: true,
        credits: true,
      },
    })

    const isResume = userRecord?.resume

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Resume Bueno</h1>
        <h2 className="text-xl font-bold mb-4">
          Resume&nbsp; &nbsp;+&nbsp; &nbsp;Job Description&nbsp; &nbsp;=&nbsp;
          &nbsp;Resume Bueno
        </h2>
        {!isResume && (
          <Link
            href="/resume/add"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white hover:text-white px-4 py-2 rounded mb-4"
          >
            Get Started
          </Link>
        )}
        {isResume && (
          <Link
            href="/custom-resume"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white hover:text-white px-4 py-2 rounded mb-4"
          >
            Make Custom Resume
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Resume Bueno</h1>
      <h2 className="text-xl font-bold mb-4">
        Resume&nbsp; &nbsp;+&nbsp; &nbsp;Job Description&nbsp; &nbsp;=&nbsp;
        &nbsp;Resume Bueno
      </h2>
      <Link
        href="/resume/add"
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white hover:text-white px-4 py-2 rounded mb-4"
      >
        Get Started
      </Link>
    </div>
  )
}
