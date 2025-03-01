import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg">Page Not Found</p>
      <Link href="/" className="mt-6 text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  )
}
