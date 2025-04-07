import { CheckCircle2 } from 'lucide-react'

export default function SuccessLoading() {
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
          <p className="text-gray-700">Your payment is being processed.</p>
          <div className="flex justify-center my-6">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
          <p className="text-gray-600">
            We&apos;re confirming your payment details...
          </p>
        </div>
      </div>
    </div>
  )
}
