import Link from 'next/link'

// This is our custom 404 page that will be used in Next.js app directory
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t find the page you were looking for. It might have
          been removed, renamed, or didn&apos;t exist in the first place.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
