'use client'

import { Suspense } from 'react'
import CheckoutContent from './CheckoutContent'
import { Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <span className="ml-3 text-lg">Loading checkout details...</span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
