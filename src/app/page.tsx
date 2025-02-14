'use server'
import { auth } from '@/auth'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function Home() {
  const session = await auth()

  if (session?.user && session.user.email) {
    // Fetch the user's resume field
    const userRecord = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    const showGetStarted = !userRecord?.resume

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">next-15-prisma-auth</h1>
        {showGetStarted && (
          <Link
            href="/resume/add"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white hover:text-white px-4 py-2 rounded mb-4"
          >
            Get Started
          </Link>
        )}
        <p>You are logged in</p>
        <p>Hello {session.user.name}</p>
        <p>User Info is a protected route</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">nex-15-prisma-auth</h1>
      <Link
        href="/resume/add"
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white hover:text-white px-4 py-2 rounded mb-4"
      >
        Get Started
      </Link>
      <p>You are NOT logged in</p>
      <Link
        href="/api/auth/signin"
        className="text-blue-500 hover:text-blue-700"
      >
        Sign In - /api/auth/signin
      </Link>
      <p>User Info is a protected route</p>
    </div>
  )
}
