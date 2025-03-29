'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function PricingSection() {
  const { data: session } = useSession()
  const router = useRouter()

  const handlePlanClick = (planType: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    router.push(`/checkout-page?plan=${planType}`)
  }

  return (
    <div id="pricing" className="mt-24 mb-16">
      <div className="text-center max-w-3xl mx-auto px-4 py-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Select the perfect plan to elevate your resume and land your dream job
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3 px-4">
        {/* Free Plan */}
        <div className="relative p-8 bg-white border border-gray-200 shadow-md h-[600px] rounded-2xl hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold text-center mb-2">Basic</h3>
          <div className="flex items-center justify-center gap-1 mb-6 mt-6">
            <span className="text-4xl font-bold">FREE</span>
          </div>
          <div className="h-8 mb-6 flex items-center justify-center">
            <span className="text-sm text-gray-500">Get started instantly</span>
          </div>

          <ul className="mb-8 space-y-4">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Get started instantly</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>20 free credits upon signup</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Match your resume to the job description</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Job match and employer analysis</span>
            </li>
          </ul>

          <div className="absolute w-full px-8 bottom-8 left-0">
            <Button className="w-full" asChild>
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Monthly Plan */}
        <div className="relative p-8 bg-white border-2 border-violet-200 shadow-xl h-[600px] rounded-2xl hover:shadow-2xl transition-shadow duration-300 transform scale-105 z-10">
          {/* Popular Badge */}
          <div className="absolute top-0 px-6 py-1 text-white -translate-x-1/2 -translate-y-1/2 rounded-full left-1/2 bg-teal-700">
            Most Popular
          </div>

          <h3 className="text-xl font-bold text-center mb-2">Monthly</h3>
          <div className="flex flex-col items-center justify-center mb-1 mt-4">
            <span className="text-xl font-semibold  text-gray-600 line-through mb-1">
              $14.95
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-4xl font-bold">$9.95</span>
              <span className="text-gray-600">/mo</span>
            </div>
          </div>
          <div className="h-8 mb-6 flex items-center justify-center">
            <span className="text-sm text-violet-800 font-semibold">
              Billed monthly
            </span>
          </div>

          <ul className="mb-8 space-y-4">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>200 credits per month</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Same features as Basic Plan</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Advanced job match scoring</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>One-click unsubscribe</span>
            </li>
          </ul>

          <div className="absolute w-full px-8 bottom-8 left-0">
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-md"
              onClick={() => handlePlanClick('monthly')}
            >
              Choose Plan
            </Button>
          </div>
        </div>

        {/* Year Plan */}
        <div className="relative p-8 bg-white border border-gray-200 shadow-md h-[600px] rounded-2xl hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold text-center mb-2">Year</h3>
          <div className="flex flex-col items-center justify-center mb-1 mt-4">
            <span className="text-xl font-semibold  text-gray-600 line-through mb-1">
              $119.40
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-4xl font-bold">$45</span>
              <span className="text-gray-600">/year</span>
            </div>
          </div>
          <div className="h-8 mb-6 flex items-center justify-center">
            <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Save 65%
            </span>
          </div>

          <ul className="mb-8 space-y-4">
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>
                Save <strong>$74.40</strong> for the year
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>200 credits per month for 12 months</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Same feature as monthly plan</span>
            </li>

            {/* <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Personalized resume feedback</span>
            </li> */}
            <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>One-time payment, no need to cancel</span>
            </li>
            {/* <li className="flex items-center gap-3">
              <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
              <span>Priority support</span>
            </li> */}
          </ul>

          <div className="absolute w-full px-8 bottom-8 left-0">
            <Button
              className="w-full"
              onClick={() => handlePlanClick('yearly')}
            >
              Best Value
            </Button>
          </div>
        </div>
      </div>

      <p className="max-w-4xl mx-auto mt-12 pb-6 text-center text-gray-600 px-4">
        Monthly and Year customers can purchase{' '}
        <button
          className="text-blue-600 underline hover:text-blue-800"
          onClick={() => handlePlanClick('additional-credits')}
        >
          Additional Credits
        </button>
        . For $9.95, you get an additional 200 credits towards your monthly
        quota.
        <br />
        <br />
        <span className="font-semibold">1 credit = </span>
        Expert job analysis + resume recommendations + cover letter OR a
        perfectly matched resume.
      </p>
    </div>
  )
}
