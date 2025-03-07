'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSubscriptionCheckout } from '@/lib/actions/subscription'
import { SubscriptionType } from '@/lib/types/subscription'
import { ArrowLeft, CircleCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CheckoutContent() {
  const searchParams = useSearchParams()
  const planType = searchParams.get('plan') || 'monthly'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Format the plan for display
  const formattedPlanType = planType === 'yearly' ? 'Yearly' : 'Monthly'

  // Calculate the price
  const price = planType === 'yearly' ? 45 : 9.95

  // Features for the plan
  const features = [
    '200 credits every month',
    'AI-powered resume analysis',
    'Custom cover letters',
    'Expert job analysis',
    'Resume recommendations',
    planType === 'yearly' ? '65% savings' : '',
  ].filter(Boolean)

  // Handle checkout
  const handleCheckout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Create checkout session
      const subscriptionType =
        planType === 'yearly'
          ? SubscriptionType.YEARLY
          : SubscriptionType.MONTHLY

      const result = await createSubscriptionCheckout(subscriptionType)

      if (result.error) {
        setError(result.error)
        return
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      } else {
        setError('Failed to create checkout session')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-5xl py-8 md:py-12">
      <Link
        href="/#pricing"
        className="flex items-center text-sm mb-6 hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to pricing
      </Link>

      <h1 className="text-3xl font-bold mb-8">Confirm Your Plan</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {formattedPlanType} Plan
          </h2>

          <div className="flex items-baseline mb-6">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-gray-600 ml-1">
              {planType === 'yearly' ? '/year' : '/month'}
            </span>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CircleCheck className="w-5 h-5 text-teal-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>

          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span>Plan</span>
              <span>{formattedPlanType}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Billing</span>
              <span>{planType === 'yearly' ? 'Annually' : 'Monthly'}</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>
              ${price}
              {planType === 'yearly' ? '/year' : '/month'}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            You will be redirected to Stripe to complete your purchase.
          </p>
        </div>
      </div>
    </div>
  )
}
