'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cancelUserSubscription } from '@/lib/actions/subscription'
import { Loader2 } from 'lucide-react'

interface SubscriptionManagementProps {
  user: {
    credits: number | null
    subscription_plan: string | null
    subscription_status: string | null
    subscription_end: Date | null
  }
}

export function SubscriptionManagement({ user }: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await cancelUserSubscription()
      if (!result.success) {
        setError(result.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Subscription & Credits
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Available Credits
            </label>
            <p className="text-2xl font-semibold">{user.credits || 0}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Subscription Plan
            </label>
            <p className="text-lg font-medium">
              {user.subscription_plan || 'No active plan'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Status
            </label>
            <p className="text-lg font-medium">
              {user.subscription_status || 'Inactive'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Next Billing Date
            </label>
            <p className="text-lg font-medium">
              {formatDate(user.subscription_end)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {user.subscription_status === 'ACTIVE' ? (
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Cancel Subscription'
              )}
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/#pricing">View Plans</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
