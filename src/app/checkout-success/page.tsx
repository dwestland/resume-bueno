'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import CheckoutSuccessContent from './CheckoutSuccessContent'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-3xl py-16 text-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 animate-spin text-violet-600 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
            <p className="text-gray-600">
              Please wait while we load your purchase information.
            </p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
