'use server'

import { requireAuth } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import SuccessContent from './success-content'
import { Suspense } from 'react'
import { processCheckoutSession } from './actions'

interface SuccessPageProps {
  searchParams: {
    session_id?: string
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // Require authentication
  await requireAuth()

  // Await searchParams
  const params = await searchParams
  const { session_id } = params

  if (!session_id) {
    redirect('/')
  }

  // Process the checkout session
  // The revalidation is now handled client-side in the success-content component
  const result = await processCheckoutSession(session_id)

  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent result={result} sessionId={session_id} />
    </Suspense>
  )
}

function SuccessLoading() {
  return (
    <div className="container max-w-lg py-10">
      <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Processing Your Purchase...</h1>

        <p className="text-gray-600 mb-4">
          We&apos;re confirming your payment details. Please wait a moment.
        </p>
      </div>
    </div>
  )
}
