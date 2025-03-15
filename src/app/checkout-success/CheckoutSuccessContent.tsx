'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CheckoutSuccessContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // We don't need to do anything special here since Stripe webhooks
    // will handle updating the subscription in the database.
    // This is just a visual confirmation page.

    // If there's a session ID, consider it a success
    if (sessionId) {
      // Short timeout to show the loading state for a moment
      const timer = setTimeout(() => {
        setStatus('success')
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      setStatus('error')
    }
  }, [sessionId])

  return (
    <div className="container max-w-3xl py-16 text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-16 h-16 animate-spin text-violet-600 mb-6" />
          <h1 className="text-2xl font-bold mb-2">
            Processing your payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your subscription.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">
            Thank You for Your Purchase!
          </h1>
          <p className="text-gray-600 mb-8">
            Your subscription has been successfully processed. Your account has
            been credited with 200 credits, and you now have full access to all
            features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/custom-resume">Create My First Resume</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <span className="text-2xl text-red-500">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t process your subscription. Please contact support
            or try again.
          </p>

          <Button asChild>
            <Link href="/#pricing">Return to Pricing</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
