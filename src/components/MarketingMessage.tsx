'use client'

import React from 'react'
// import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import StudentReviews from '@/components/StudentReviews'
import PricingSection from './PricingSection'

const MarketingMessage: React.FC = () => {
  return (
    <section className="marketing-section pt-0 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Identify the problem */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto mb-8">
              <h2 className="text-3xl font-bold text-center mb-6 text-gray-900">
                Here&apos;s the Harsh Reality
              </h2>
              <div className="h-1 max-w-44 bg-teal-600 mx-auto mb-8"></div>
              <p className="text-xl mb-6 text-center text-gray-700">
                Most resumes are rejected before they&apos;re even read.
                <span className="block  text-center font-semibold mt-2">
                  You&apos;re not being judged unfairly. You&apos;re not being
                  judged at all.
                </span>
              </p>
              <p className="text-xl mb-6 text-gray-700">
                Did you know that up to 75% of resumes never make it to the
                hiring manager&apos;s desk? They get stuck in the Applicant
                Tracking System (ATS), an automated filter that scans resumes
                for keywords, qualifications, and formatting. If your resume
                doesn&apos;t pass this first digital test, it&apos;s discarded
                before a human even lays eyes on it.
              </p>
            </div>
          </div>
        </div>

        {/* Provide a solution */}
        <div className="py-8 max-w-7xl mx-auto">
          <div className="container mx-auto px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">
                  Introducing
                  <span className="text-violet-800 block">Resume Bueno</span>
                </h2>
                <p className="text-2xl mb-6 text-gray-700">
                  Forget ChatGPT, this is different.{' '}
                  <strong>Resume Bueno</strong> uses a proprietary{' '}
                  <strong>AI trained on thousands of resumes</strong> accepted
                  by Fortune 500 companies, immediately aligning your resume
                  with exactly what hiring managers want. It quickly rewrites
                  your resume, creates a tailored cover letter, and even
                  calculates your match score. And the best part?{' '}
                  <strong>
                    It&apos;s easy, it&apos;s fast, and you can start using it
                    for free today
                  </strong>
                  .
                </p>
              </div>
              <div className="md:w-1/2">
                <div className="relative w-full h-80 md:h-80 flex items-center justify-center">
                  <Image
                    src="/images/workspace.svg"
                    alt="Introducing Resume Bueno"
                    width={400}
                    height={300}
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* University Logos Section */}
          <section className="logos-section border-t border-gray-200">
            <StudentReviews />
          </section>

          {/* Detail the benefits */}
          <div className="py-4">
            <div className="py-8 bg-white">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
                    Everything You Need to Land the Job, All Included
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 shadow-md border-t-4 border-teal-600 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-violet-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Job-Matched Resume
                        </h3>
                      </div>
                      <p className="text-xl text-gray-700">
                        Resumes precisely structured, formatted, and optimized
                        to align perfectly with every job description.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 shadow-md border-t-4 border-teal-600 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-violet-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Job Evaluation Score
                        </h3>
                      </div>
                      <p className="text-xl text-gray-700">
                        Instantly discover how closely your resume matches
                        before applying to any job.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 shadow-md border-t-4 border-teal-600 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-violet-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Custom Cover Letters
                        </h3>
                      </div>
                      <p className="text-xl text-gray-700">
                        Automatically generate personalized, compelling cover
                        letters tailored specifically to each unique job
                        posting.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 shadow-md border-t-4 border-teal-600 hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-violet-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Resume Insights
                        </h3>
                      </div>
                      <p className="text-xl text-gray-700">
                        Clear, specific recommendations showing exactly how to
                        improve your resume&apos;s performance immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <section className="pricing-section bg-gray-50">
            <PricingSection />
          </section>

          <div className="h-1 max-w-60 bg-teal-600 mx-auto mt-8 mb-16"></div>

          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="space-y-6 mb-10">
                <p className="text-3xl text-gray-700">
                  You&apos;ve seen what Resume Bueno can do, generate custom,
                  high-converting resumes, cover letters, and job match analysis
                  in seconds.
                </p>

                <p className="text-3xl text-gray-700">
                  You&apos;ve got free access waiting. No strings. No risk.
                </p>

                <p className="text-3xl text-gray-200xl font-semibold text-violet-800">
                  This might be the most important step you take toward your
                  next job.
                </p>
              </div>

              <p className="text-2xl mb-8 text-gray-700">
                Don&apos;t wait. Click below and try it free, before someone
                else gets the job you wanted.
              </p>

              <a
                href="https://www.resumebueno.com/pricing"
                className="inline-block bg-violet-800 hover:bg-violet-700 text-white font-semibold py-4 px-10 rounded-md text-lg transition-all shadow-lg hover:shadow-xl border-b-4 border-teal-600"
              >
                Start Today for Free
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MarketingMessage
