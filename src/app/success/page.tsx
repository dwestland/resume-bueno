'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait a moment to ensure webhook has processed
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container max-w-4xl py-12">
      <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Thank You for Your Purchase!
        </h1>

        <div className="space-y-4 mb-8">
          <p className="text-lg">
            Your payment has been successfully processed.
          </p>
          <p>
            {loading ? (
              <span className="text-gray-600">
                We&apos;re updating your account. Please wait a moment...
              </span>
            ) : (
              <span className="text-gray-600">
                Your account has been updated with your purchase.
              </span>
            )}
          </p>
          <p className="text-gray-600 text-sm">
            Session ID: {sessionId || 'Not provided'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Link>
          </Button>

          <Button asChild>
            <Link href="/custom-resume">Create a Custom Resume</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
