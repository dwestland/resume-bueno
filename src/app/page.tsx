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
      {/* Hero Section */}
      <div className="min-h-[calc(100vh-2rem)] flex flex-col">
        <div className="mb-auto">
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
        </div>

        <div className="flex flex-col items-center justify-center gap-6 mb-auto">
          {isLoggedIn ? (
            <Button asChild>
              <Link href="/custom-resume">Make Custom Resume</Link>
            </Button>
          ) : (
            <Button>
              <Link href="/checkout">Get Started</Link>
            </Button>
          )}

          <div className="max-w-2xl text-center">
            <h2 className="mb-4">Land More Interviews, Effortlessly</h2>
            <p>
              Upload your resume, add a job description, and let Resume Bueno do
              the rest. Get a match score, targeted resume improvements, and a
              polished cover letter, instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mt-24 mb-16">
        <h2 className="mb-4 text-4xl font-bold text-center">
          Choose Your Pricing Plan
        </h2>
        <p className="mb-12 text-xl text-center text-gray-500">
          Place holder text
        </p>

        {/* Pricing Cards */}
        <div className="grid max-w-4xl grid-cols-1 gap-8 mx-auto md:grid-cols-2">
          {/* Free Plan */}
          <div className="relative p-8 bg-white border border-gray-100 shadow-lg h-[600px] rounded-3xl">
            <h3 className="mb-2 text-4xl font-bold text-center">Basic</h3>
            <div className="flex items-center justify-center gap-1 mb-6">
              <span className="text-5xl font-bold">FREE</span>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>20 free credits on signup</p>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>AI resume analysis</p>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>Custom cover letters</p>
              </li>
            </ul>

            <Button className="absolute w-1/2 mx-8 transform -translate-x-1/2 left-1/2 bottom-8">
              <Link href="/checkout">Choose Plan</Link>
            </Button>
          </div>

          {/* Standard Plan */}
          <div className="relative p-8 bg-white border-2 shadow-lg h-[600px] rounded-3xl border-violet-200">
            {/* Popular Badge */}
            <div className="absolute top-0 px-6 py-1 text-white -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 bg-violet-600">
              Popular
            </div>

            <h3 className="mb-2 text-4xl font-bold text-center">Standard</h3>
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-5xl font-bold">$9.95</span>
              <span className="">/month</span>
            </div>
            <p className="mb-6 text-sm text-violet-600">
              Save 65% with annual billing
            </p>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>Unlimited resume customizations</p>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>Priority AI processing</p>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>Advanced job matching</p>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                    d="M5 13l4 4L19 7"
                    transform="translate(0, 2)"
                  />
                </svg>
                <p>Premium support</p>
              </li>
            </ul>

            <Button className="absolute w-1/2 mx-8 transform -translate-x-1/2 left-1/2 bottom-8">
              <Link href="/checkout">Choose Plan</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
