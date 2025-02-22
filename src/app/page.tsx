'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ClientHome() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  const isLoggedIn = session?.user && session.user.email

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

      {isLoggedIn ? (
        <Button asChild>
          <Link href="/custom-resume">Make Custom Resume</Link>
        </Button>
      ) : (
        <Button>
          <Link href="/resume/add">Get Started</Link>
        </Button>
      )}

      <h2>Land More Interviews, Effortlessly</h2>
      <p className="text-xl">
        Upload your resume, add a job description, and let Resume Bueno do the
        rest. Get a match score, targeted resume improvements, and a polished
        cover letter, instantly.
      </p>
    </div>
  )
}
