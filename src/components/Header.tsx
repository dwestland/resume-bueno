'use client'

import Link from 'next/link'
import React from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()
  return (
    <header className="container mx-auto p-4 bg-violet-700 text-gray-100">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-semibold hover:underline">
            Home
          </Link>
          <Link href="/messages" className="font-semibold hover:underline">
            Messages
          </Link>

          {session?.user && (
            <>
              <Link
                href="/resume/display"
                className="font-semibold hover:underline"
              >
                My Resume
              </Link>
              <Link href="/history" className="font-semibold hover:underline">
                History
              </Link>
              <Link
                href="/custom-resume"
                className="font-semibold hover:underline"
              >
                Make Custom Resume
              </Link>
              <Link href="/samples" className="font-semibold hover:underline">
                Samples
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="  text-gray-100 font-semibold hover:underline"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/auth/signin" className="font-semibold hover:underline">
              Sign Up / Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
