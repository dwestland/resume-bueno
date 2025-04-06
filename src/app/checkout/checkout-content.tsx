'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CheckoutErrorProps {
  error?: string
}

export default function CheckoutError({ error }: CheckoutErrorProps) {
  return (
    <div className="container max-w-lg py-10">
      <div className="bg-white rounded-lg border shadow-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Checkout Error</h1>
          <p className="text-gray-600">
            {error || 'An error occurred while creating your checkout session.'}
          </p>
        </div>

        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
