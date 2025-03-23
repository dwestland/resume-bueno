'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'

const MarketingMessage: React.FC = () => {
  return (
    <section className="marketing-section py-16 bg-gradient-to-b from-white to-teal-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Transform Your Job Search
          </h2>
          <div className="w-20 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Get more interviews with tailored resumes that stand out
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-teal-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ATS-Optimized
              </h3>
              <p className="text-gray-600 mb-6">
                Beat automated screening systems with perfectly matched keywords
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    3.4× higher interview rates
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Instantly ATS-friendly
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-violet-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Save Hours
              </h3>
              <p className="text-gray-600 mb-6">
                Generate tailored resumes in seconds, not hours
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    20+ hours saved monthly
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Focus on interviews, not edits
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-teal-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Professional Edge
              </h3>
              <p className="text-gray-600 mb-6">
                Compete with candidates using expensive resume services
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Premium results at a fraction of the cost
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">
                    Highlight your most relevant skills
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700 font-medium max-w-2xl mx-auto">
            Every day with a generic resume is a missed opportunity. Start
            standing out today.
          </p>
        </div>
      </div>
    </section>
  )
}

export default MarketingMessage
