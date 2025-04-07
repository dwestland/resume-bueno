'use server'

import { requireAuth } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { createCheckoutSession } from './actions'
import { StripeProductType } from '@/lib/stripe'
import CheckoutError from './checkout-content'
import { Suspense } from 'react'

interface CheckoutPageProps {
  searchParams: Promise<{
    plan?: string
  }>
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  // Require authentication
  await requireAuth()

  // Validate plan parameter - await searchParams
  const params = await searchParams
  const { plan } = params

  if (!plan || !['monthly', 'year', 'additional-credits'].includes(plan)) {
    redirect('/')
  }

  const planType = plan as StripeProductType

  // Create checkout session and redirect
  const result = await createCheckoutSession(planType)

  if (result.success && result.url) {
    redirect(result.url)
  }

  // If we're still here, there was an error
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutError error={result.error} />
    </Suspense>
  )
}

function CheckoutLoading() {
  return (
    <div className="container max-w-lg py-10">
      <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Preparing Checkout...</h1>

        <p className="text-gray-600 mb-4">
          We&apos;re setting up your checkout session. Please wait a moment.
        </p>
      </div>
    </div>
  )
}
