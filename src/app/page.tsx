'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { checkUserResume, getResumeProgress } from './actions'
import { ResumeProgress } from '@/components/ResumeProgress'
import { AddResumeDialog } from '@/components/AddResumeDialog'
import PricingSection from '@/components/PricingSection'

export default function ClientHome() {
  const { data: session, status } = useSession()
  const [hasResume, setHasResume] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
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

        // Show dialog if user is logged in but doesn't have a resume
        if (resumeStatus === false) {
          setShowResumeDialog(true)
        }

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
      {/* Add Resume Dialog */}
      <AddResumeDialog
        open={showResumeDialog}
        onOpenChange={setShowResumeDialog}
      />

      <div id="opening-page" className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Hero Section - Exactly 50% height */}
        <div id="hero-section" className="flex flex-col md:flex-row h-[50%]">
          <div id="hero-text" className="w-full md:w-1/2 pt-4 pb-4 md:pb-0">
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
              <h1
                className="text-8xl mt-0 leading-[5.5rem]"
                style={{ marginLeft: '-5px' }}
              >
                Resume
                <br />
                Bueno
              </h1>
              <h2 className="mt-1 text-4xl">
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
            className="relative w-full h-72 md:w-1/2 md:h-auto min-h-[20rem] hidden md:block"
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

        {/* Button and Text Section - Exactly 50% height */}
        <div
          id="call-to-action"
          className="flex flex-col justify-center items-center h-[50%]"
        >
          <div id="call-to-action-button">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center">
                <Button size="lg" className="text-xl">
                  <Link href="/resume/add">Get Started for FREE</Link>
                </Button>

                <div id="call-to-action-text">
                  <h2 className="m-auto mt-4 mb-8">
                    Land More Interviews, Effortlessly
                  </h2>
                </div>
              </div>
            ) : hasResume ? (
              <Button size="lg" className="text-xl">
                <Link href="/custom-resume">Make Resume Package</Link>
              </Button>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="mt-4 mb-8">Step 1. Upload Your Resume</h2>
                <Button size="lg" className="text-xl">
                  <Link href="/resume/add">Add Your Resume</Link>
                </Button>
              </div>
            )}
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
      <PricingSection />
    </div>
  )
}
