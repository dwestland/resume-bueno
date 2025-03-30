'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Force redirect unauthorized users
  useEffect(() => {
    // Wait until session is loaded
    if (status === 'loading') return

    // If not authenticated, redirect to sign-in
    if (!session) {
      router.replace('/auth/signin?callbackUrl=/dashboard')
      return
    }

    // Check role - only ADMIN and MANAGER can access
    const userRole = session.user?.role
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      console.log('Unauthorized role:', userRole)
      router.replace('/')
    }
  }, [session, status, router])

  // Show loading state if session is loading or not yet checked
  if (status === 'loading' || !session) {
    return <div className="container py-10">Loading...</div>
  }

  // If we reach here and role is wrong, show nothing while redirecting
  if (session.user?.role !== 'ADMIN' && session.user?.role !== 'MANAGER') {
    return null
  }

  // Only ADMIN and MANAGER will see this content
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Access Granted</h2>
        <p className="mb-2">You are logged in as:</p>
        <p className="font-bold">{session.user.name || session.user.email}</p>
        <p className="text-sm mt-1">
          Role:{' '}
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            {session.user.role}
          </span>
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Dashboard Content</h2>
        <p>
          This content is only visible to users with ADMIN or MANAGER roles.
        </p>
      </div>
    </div>
  )
}
