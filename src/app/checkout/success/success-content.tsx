'use client'

import { CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { type SessionStatusResponse } from '@/lib/validations/checkout'
import { useEffect } from 'react'
import { revalidateAfterCheckout } from './actions'

interface SuccessContentProps {
  result: SessionStatusResponse
  sessionId: string
}

export default function SuccessContent({
  result,
  sessionId,
}: SuccessContentProps) {
  // Call revalidation function once when component mounts
  useEffect(() => {
    if (result.success) {
      // Fire and forget - we don't need to await this
      revalidateAfterCheckout().catch(console.error)
    }
  }, [result.success])

  return (
    <div className="container max-w-lg py-10">
      <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Thank You for Your Purchase!
        </h1>

        <div className="space-y-4 mb-8">
          <p className="text-gray-700">
            {result.success
              ? 'Your payment has been processed successfully.'
              : 'Your payment is being processed.'}
          </p>
          {result.success && (
            <div className="space-y-2">
              <p className="text-gray-600">Your purchase has been recorded.</p>
              <p className="text-gray-600 text-sm">
                Your subscription status and credits will be updated after we
                receive the payment confirmation from Stripe.
              </p>
            </div>
          )}
          {!result.success && (
            <p className="text-gray-600">
              We&apos;ll update your account as soon as your payment is
              confirmed.
            </p>
          )}

          <p className="text-sm text-gray-500">Session ID: {sessionId}</p>
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
