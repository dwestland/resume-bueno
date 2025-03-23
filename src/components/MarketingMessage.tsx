'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'

const MarketingMessage: React.FC = () => {
  return (
    <section className="marketing-section py-12 bg-gradient-to-b from-white to-teal-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Transform Your Job Search
          </h2>
          <div className="w-24 h-1.5 bg-teal-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Get more interviews with tailored resumes that stand out
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-teal-50 py-1 px-6">
              <h3 className="text-xl font-bold text-teal-800">ATS-Optimized</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Beat automated screening systems with perfectly matched keywords
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    3.4× higher interview rates
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Instantly ATS-friendly
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-teal-50 py-1 px-6">
              <h3 className="text-xl font-bold text-teal-800">Save Hours</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Generate tailored resumes in seconds, not hours
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    20+ hours saved monthly
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Focus on interviews, not edits
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-teal-50 py-1 px-6">
              <h3 className="text-xl font-bold text-teal-800">
                Professional Edge
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Compete with candidates using expensive resume services
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Premium results at a fraction of the cost
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-violet-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Highlight your most relevant skills
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="px-4 py-8">
          <p className="">
            At Resume Bueno, we don&apos;t sell resume services; we sell
            interview opportunities and career advancement. Begin your
            professional transformation today with our complimentary 20-credit
            trial — because the difference between continued rejection and your
            next career milestone is simply a matter of presentation.
          </p>
        </div>

        {/* <div className="mt-14 text-center">
          <div className="bg-gradient-to-r from-teal-50 to-violet-50 max-w-3xl mx-auto rounded-lg p-8 border border-teal-200 shadow-sm">
            <p className="text-gray-700 font-medium mb-6">
              Every day with a generic resume is a missed opportunity. Start
              standing out today.
            </p>
            <a
              href="/resume/add"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              Try for Free
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 h-4 w-4"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </div> */}
      </div>
    </section>
  )
}

export default MarketingMessage
