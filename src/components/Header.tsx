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
    <header className="container px-8 py-4 mx-auto text-gray-100 bg-violet-700">
      <nav className="flex items-center justify-between">
        <button
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <div className="items-center hidden space-x-4 md:flex">
          <Link href="/" className="font-semibold hover:underline">
            Home
          </Link>
          <Link href="/#pricing" className="font-semibold hover:underline">
            Pricing
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

        <div className="items-center hidden space-x-4 md:flex">
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="font-semibold text-gray-100 hover:underline"
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
        <div className="mt-4 space-y-2 md:hidden">
          <Link
            href="/"
            className="block text-xl font-semibold leading-loose hover:underline"
          >
            Home
          </Link>
          <Link
            href="/messages"
            className="block text-xl font-semibold leading-loose hover:underline"
          >
            Messages
          </Link>

          {session?.user && (
            <>
              <Link
                href="/resume/display"
                className="block text-xl font-semibold leading-loose hover:underline"
              >
                My Resume
              </Link>
              <Link
                href="/history"
                className="block text-xl font-semibold leading-loose hover:underline"
              >
                History
              </Link>
              <Link
                href="/custom-resume"
                className="block text-xl font-semibold leading-loose hover:underline"
              >
                Make Custom Resume
              </Link>
              <Link
                href="/samples"
                className="block text-xl font-semibold leading-loose hover:underline"
              >
                Samples
              </Link>
            </>
          )}

          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="block text-xl font-semibold leading-loose text-gray-100 hover:underline"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block text-xl font-semibold leading-loose hover:underline"
            >
              Sign Up / Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
