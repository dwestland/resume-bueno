'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { checkUserResume, getResumeProgress } from './actions'
import { ResumeProgress } from '@/components/ResumeProgress'
import { AddResumeDialog } from '@/components/AddResumeDialog'
import MarketingMessage from '@/components/MarketingMessage'

export default function ClientHome() {
  const { data: session, status } = useSession()
  const [hasResume, setHasResume] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [resumeProgress, setResumeProgress] = useState<{
    completionPercentage: number
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
            completionPercentage: progress.completionPercentage,
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
        <div className="loading-spinner-container text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <svg
              className="animate-spin -ml-1 mr-3 h-10 w-10 text-teal-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          <p className="loading-text text-gray-600 font-medium">
            Loading Resume Bueno...
          </p>
        </div>
      </div>
    )
  }

  const isLoggedIn = session?.user && session.user.email

  return (
    <div className="home-container">
      {/* Add Resume Dialog */}
      <AddResumeDialog
        open={showResumeDialog}
        onOpenChange={setShowResumeDialog}
      />

      <div id="opening-page" className="min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Hero Section */}
        <div
          id="hero-section"
          className="flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 py-8 md:py-16"
        >
          <div id="hero-text" className="w-full md:w-1/2 pt-4 pb-4 md:pb-0">
            <div className="hero-content max-w-md mx-auto md:mx-0 md:max-w-none md:pr-8">
              <div className="beta-badge inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded mb-2">
                <p
                  className="text-base font-semibold tracking-tight"
                  style={{
                    fontFamily: 'var(--font-oswald)',
                    margin: 0,
                  }}
                >
                  BETA
                </p>
              </div>
              <h2
                className="site-title text-5xl sm:text-6xl lg:text-8xl mt-0 leading-tight font-bold"
                style={{ marginLeft: '-5px' }}
              >
                Resume
                <br />
                Bueno
              </h2>
              <h1 className="site-tagline mt-1 text-2xl sm:text-3xl lg:text-4xl text-violet-800 leading-tight">
                Resume&nbsp;+&nbsp;Job Description
                <br />
                &nbsp;=&nbsp;Resume Bueno
              </h1>

              <p className="site-description mt-4 text-base sm:text-lg text-gray-700 max-w-xl">
                Upload your resume, add a job description, and let Resume Bueno
                do the rest. Get a match score, targeted resume improvements,
                and a polished cover letter, instantly.
              </p>

              <div className="teal-accent-line max-w-44 h-1 bg-teal-600 rounded mt-6 hidden md:block"></div>
            </div>
          </div>

          <div
            id="hero-image"
            className="hero-image-wrapper relative w-full h-64 sm:h-80 md:w-1/2 md:h-auto min-h-[20rem] mt-8 md:mt-0 flex items-center justify-center"
          >
            <div className="relative w-full h-full max-w-md mx-auto">
              <Image
                src="/images/at-work.svg"
                alt="Online CV"
                fill
                className="object-contain z-10"
                priority
              />
              <div className="decoration-circle absolute -top-10 -right-10 w-40 h-40 bg-teal-100 rounded-full opacity-70 blur-xl -z-10"></div>
              <div className="decoration-circle absolute -bottom-10 -left-10 w-32 h-32 bg-violet-100 rounded-full opacity-70 blur-xl -z-10"></div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div
          id="call-to-action"
          className="cta-section flex flex-col justify-center items-center py-8 md:py-16 px-4"
        >
          <div className="cta-container text-center max-w-3xl mx-auto">
            {!isLoggedIn ? (
              <div className="cta-content flex flex-col items-center">
                <p className="text-2xl sm:text-2xl font-semibold text-gray-800 my-6">
                  Get 20 FREE Credits Today & Unlock the &quot;4X Interview Rate
                  Formula&quot; — Try Resume Bueno&apos;s Complete System
                  Without Paying a Penny
                </p>
                <Button
                  size="lg"
                  className="cta-button text-lg px-8 py-6 bg-violet-600 hover:bg-violet-700 transition-all"
                >
                  <Link href="/resume/add">Get Started for FREE</Link>
                </Button>

                <div className="cta-text">
                  <p className="text-left my-6">
                    Start transforming your job search immediately with enough
                    credits to land your dream position. Create perfectly
                    matched resumes, receive qualification scores, and generate
                    custom cover letters with zero risk. No credit card required
                    to start using Resume Bueno for free!
                  </p>
                </div>
              </div>
            ) : hasResume ? (
              <div className="cta-content flex flex-col items-center">
                <Button
                  size="lg"
                  className="cta-button text-lg px-8 py-6 bg-violet-600 hover:bg-violet-700 transition-all"
                >
                  <Link href="/custom-resume">Make CustomResume</Link>
                </Button>
                <h2 className="cta-text mt-6 text-2xl sm:text-3xl text-gray-800">
                  Let&apos;s get that job!
                </h2>
              </div>
            ) : (
              <div className="cta-content flex flex-col items-center">
                <h2 className="cta-text mt-4 mb-6 text-2xl sm:text-3xl text-gray-800">
                  Step 1. Upload Your Resume
                </h2>
                <Button
                  size="lg"
                  className="cta-button text-lg px-8 py-6 bg-violet-600 hover:bg-violet-700 transition-all"
                >
                  <Link href="/resume/add">Add Your Resume</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Progress for Logged-In Users */}
      {isLoggedIn && resumeProgress && (
        <section className="progress-section w-full my-12 px-4 sm:px-6 lg:px-8 transition-all">
          <div className="progress-container max-w-3xl mx-auto">
            <ResumeProgress
              completionPercentage={resumeProgress.completionPercentage}
            />
          </div>
        </section>
      )}

      {/* Marketing Message Section */}
      <MarketingMessage />
    </div>
  )
}
