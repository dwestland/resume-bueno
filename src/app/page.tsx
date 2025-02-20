'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function ClientHome() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session?.user && session.user.email) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-2">Resume Bueno</h1>
        <h2 className="text-xl font-bold mb-4">
          Resume&nbsp; &nbsp;+&nbsp; &nbsp;Job Description&nbsp; &nbsp;=&nbsp;
          &nbsp;Resume Bueno
        </h2>
        <Link
          href="/custom-resume"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          Make Custom Resume
        </Link>
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
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Get Started
      </Link>
    </div>
  )
}
