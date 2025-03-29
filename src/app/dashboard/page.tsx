'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function DashboardPage() {
  // Get session data
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirect to login if not authenticated
      window.location.href = '/auth/signin'
    },
  })

  // Log session data for debugging
  useEffect(() => {
    if (session) {
      console.log('Session:', JSON.stringify(session, null, 2))
    }
  }, [session])

  if (status === 'loading') {
    return <div className="container py-10">Loading session...</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Session Information</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-64">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>User:</strong>{' '}
            {session?.user?.name || session?.user?.email || 'Unknown'}
          </p>
          <p>
            <strong>Role:</strong>{' '}
            {session?.user?.role || 'Not found in session'}
          </p>
          <p className="text-xs text-gray-500 mt-4">
            If role is &quot;Not found in session&quot;, check your auth.ts file
            to ensure the role is being included.
          </p>
        </div>
      </div>
    </div>
  )
}
