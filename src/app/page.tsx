'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ClientHome() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session?.user && session.user.email) {
    return (
      <div className="p-4">
        <p
          className="text-2xl font-semibold tracking-tight text-violet-800"
          style={{
            fontFamily: 'var(--font-oswald)',
            marginBottom: '-7px',
          }}
        >
          BETA
        </p>
        <h1>Resume Bueno</h1>
        <h2>Resume&nbsp;+&nbsp;Job Description&nbsp;=&nbsp;Resume Bueno</h2>

        <Button asChild>
          <Link href="/custom-resume">Make Custom Resume</Link>
        </Button>

        <h2>Land More Interviews, Effortlessly</h2>
        <p className="text-xl">
          Upload your resume, add a job description, and let Resume Bueno do the
          rest. Get a match score, targeted resume improvements, and a polished
          cover letter, instantly.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p
        className="text-2xl font-semibold tracking-tight text-violet-800"
        style={{
          fontFamily: 'var(--font-oswald)',
          marginBottom: '-7px',
        }}
      >
        BETA
      </p>
      <h1>Resume Bueno</h1>
      <h2>Resume&nbsp;+&nbsp;Job Description&nbsp;=&nbsp;Resume Bueno</h2>
      <Button>
        <Link
          href="/resume/add"
          // className="inline-block px-4 py-2 mb-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Get Started
        </Link>
      </Button>
      <h2>Land More Interviews, Effortlessly</h2>
      <p className="text-xl">
        Upload your resume, add a job description, and let Resume Bueno do the
        rest. Get a match score, targeted resume improvements, and a polished
        cover letter, instantly.
      </p>
    </div>
  )
}
