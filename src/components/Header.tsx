'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  return (
    <header className="container mx-auto p-4 bg-violet-700 text-gray-100">
      <nav className="flex items-center justify-between">
        <button
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <div className="hidden md:flex items-center space-x-4">
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

        <div className="hidden md:flex items-center space-x-4">
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-100 font-semibold hover:underline"
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

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <Link
            href="/"
            className="block font-semibold text-xl leading-loose hover:underline"
          >
            Home
          </Link>
          <Link
            href="/messages"
            className="block font-semibold text-xl leading-loose hover:underline"
          >
            Messages
          </Link>

          {session?.user && (
            <>
              <Link
                href="/resume/display"
                className="block font-semibold text-xl leading-loose hover:underline"
              >
                My Resume
              </Link>
              <Link
                href="/history"
                className="block font-semibold text-xl leading-loose hover:underline"
              >
                History
              </Link>
              <Link
                href="/custom-resume"
                className="block font-semibold text-xl leading-loose hover:underline"
              >
                Make Custom Resume
              </Link>
              <Link
                href="/samples"
                className="block font-semibold text-xl leading-loose hover:underline"
              >
                Samples
              </Link>
            </>
          )}

          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block text-gray-100 font-semibold text-xl leading-loose hover:underline"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block font-semibold text-xl leading-loose hover:underline"
            >
              Sign Up / Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
