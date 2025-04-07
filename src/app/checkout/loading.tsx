export default function CheckoutLoading() {
  return (
    <div className="container max-w-lg py-10">
      <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Preparing Checkout...</h1>

        <p className="text-gray-600 mb-6">
          We&apos;re setting up your checkout session. Please wait a moment.
        </p>
      </div>
    </div>
  )
}
