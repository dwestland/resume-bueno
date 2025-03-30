'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'

const MarketingMessage: React.FC = () => {
  return (
    <section className="marketing-section pt-0 pb-6 bg-gradient-to-b from-white to-teal-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Transform Your Job Search
          </h2>
          <div className="w-24 h-1.5 bg-teal-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools to optimize your job application process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1 - Job Evaluation Score */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-violet-50 py-1 px-6">
              <h3 className="text-xl font-bold text-violet-800">
                Job Evaluation Score
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Your personal competitive index for every job application
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Precise 1-10 competitiveness rating
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    AI analysis of experience depth and relevance
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2 - Custom Cover Letter */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-violet-50 py-1 px-6">
              <h3 className="text-xl font-bold text-violet-800">
                Custom Cover Letter
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Your perfect introduction to potential employers
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Truly personalized, not generic templates
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Addresses specific company needs
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3 - Strategic Resume Insights */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-violet-50 py-1 px-6">
              <h3 className="text-xl font-bold text-violet-800">
                Strategic Resume Insights
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Your personal application consultant
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Comprehensive resume analysis
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Specific, actionable recommendations
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4 - Job-Matched Resume */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-violet-50 py-1 px-6">
              <h3 className="text-xl font-bold text-violet-800">
                Job-Matched Resume
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Your precision application instrument
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Transforms generic resume into targeted document
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Emphasizes relevant experience and skills
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
            trial, because the difference between continued rejection and your
            next career milestone is simply a matter of presentation.
          </p>
        </div>
      </div>
    </section>
  )
}

export default MarketingMessage
