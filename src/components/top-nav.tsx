'use client'

import Link from 'next/link'
import React from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'

function TopNav() {
  const { data: session } = useSession()
  return (
    <header className="container bg-blue-200 p-4">
      <nav className="mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/messages" className="hover:underline">
            Messages
          </Link>

          {session?.user && (
            <>
              <Link href="/resume/display" className="hover:underline">
                My Resume
              </Link>
              <Link href="/history" className="hover:underline">
                History
              </Link>
              <Link href="/custom-resume" className="hover:underline">
                Make Custom Resume
              </Link>
              <Link href="/samples" className="hover:underline">
                Samples
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className=" text-blue-600 hover:text-blue-800 transition-colors;"
            >
              Sign Out
            </button>
          ) : (
            <Link href="/auth/signin" className="hover:underline">
              Sign Up / Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default TopNav
