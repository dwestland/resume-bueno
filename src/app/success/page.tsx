import { Suspense } from 'react'
import { CheckCircle2 } from 'lucide-react'
import SuccessContent from './SuccessContent'

export default function SuccessPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Suspense fallback={<SuccessLoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}

function SuccessLoadingFallback() {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-4">Thank You for Your Purchase!</h1>

      <div className="space-y-4 mb-8">
        <p className="text-lg">Your payment has been successfully processed.</p>
        <p>
          <span className="text-gray-600">
            We&apos;re updating your account. Please wait a moment...
          </span>
        </p>
      </div>
    </div>
  )
}
