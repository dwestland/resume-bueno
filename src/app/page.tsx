'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { checkUserResume, getResumeProgress } from './actions'
import { ResumeProgress } from '@/components/ResumeProgress'

export default function ClientHome() {
  const { data: session, status } = useSession()
  const [hasResume, setHasResume] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resumeProgress, setResumeProgress] = useState<{
    completedCount: number
    totalFields: number
    completionPercentage: number
    fields?: Record<string, unknown>
  } | null>(null)

  useEffect(() => {
    async function fetchResumeStatus() {
      if (session?.user) {
        const resumeStatus = await checkUserResume()
        setHasResume(resumeStatus)

        // Fetch resume progress data
        const progress = await getResumeProgress()
        if (progress) {
          setResumeProgress({
            completedCount: progress.completedCount,
            totalFields: progress.totalFields,
            completionPercentage: progress.completionPercentage,
            fields: progress.fields,
          })
        }
      }
      setIsLoading(false)
    }

    if (status !== 'loading') {
      fetchResumeStatus()
    }
  }, [session, status])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <svg
              className="animate-spin -ml-1 mr-3 h-10 w-10 text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Loading Resume Bueno...</p>
        </div>
      </div>
    )
  }

  const isLoggedIn = session?.user && session.user.email

  return (
    <div className="">
      <div className="">
        {/* Hero Section */}
        <div id="hero-section" className="flex flex-col md:flex-row h-[45vh]">
          <div id="hero-text" className="w-full pt-4 pb-4 md:w-1/2 md:pb-0">
            <div className="mx-auto w-[80%]">
              <p
                className="text-2xl font-semibold tracking-tight text-violet-800"
                style={{
                  fontFamily: 'var(--font-oswald)',
                  marginBottom: '-7px',
                }}
              >
                BETA
              </p>
              <h1 className="text-8xl leading-[5.5rem]">
                Resume
                <br />
                Bueno
              </h1>
              <h2 className="mt-2 text-4xl">
                Resume&nbsp;+&nbsp;Job Description
                <br />
                &nbsp;=&nbsp;Resume Bueno
              </h2>
            </div>

            <p className="mt-4 text-left">
              Upload your resume, add a job description, and let Resume Bueno do
              the rest. Get a match score, targeted resume improvements, and a
              polished cover letter, instantly.
            </p>
          </div>

          <div
            id="hero-image"
            className="relative w-full h-72 md:w-1/2 md:h-auto"
          >
            <Image
              src="/images/at-work.svg"
              alt="Online CV"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Button and Text Section - Centered vertically */}
        <div
          id="call-to-action"
          className="flex flex-col justify-center items-center"
        >
          <div id="call-to-action-button">
            {!isLoggedIn ? (
              <Button size="lg" className="text-xl">
                <Link href="/resume/add">Get Started for FREE</Link>
              </Button>
            ) : hasResume ? (
              <Button size="lg" className="text-xl">
                <Link href="/custom-resume">Make Resume Package</Link>
              </Button>
            ) : (
              <Button size="lg" className="text-xl">
                <Link href="/resume/add">Add Your Resume</Link>
              </Button>
            )}
          </div>
          <div id="call-to-action-text">
            <div className="">
              <h2 className="mt-4 mb-8">Land More Interviews, Effortlessly</h2>
            </div>
          </div>
        </div>

        {/* Resume Progress Indicator - Only shown when logged in */}
        {isLoggedIn && resumeProgress && (
          <div className="w-full my-12 px-4 transition-all">
            <ResumeProgress
              completedCount={resumeProgress.completedCount}
              totalFields={resumeProgress.totalFields}
              completionPercentage={resumeProgress.completionPercentage}
              fields={resumeProgress.fields}
            />
          </div>
        )}
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="mt-24 mb-16">
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
            <h3 className="mt-4 mb-2 text-4xl font-bold text-center">Basic</h3>
            <div className="flex items-center justify-center gap-1 mb-6 mt-14">
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

            <h3 className="mt-10 mb-2 text-4xl font-bold text-center">
              Standard
            </h3>
            <div className="flex items-center justify-center gap-1 mb-1 mt-14">
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
        <p>
          Use 1 credit: Get expert job and resume analysis + resume
          recommendations + cover letter OR a perfectly matched resume. Your
          choice.
        </p>
      </div>
    </div>
  )
}
