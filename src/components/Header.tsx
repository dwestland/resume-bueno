'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Check if user has admin privileges
  const isAdminOrManager =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER'

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  return (
    <header className="w-full py-4 text-gray-100 bg-violet-700">
      <nav className="container max-w-screen-xl flex items-center justify-between">
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
          <Link
            href="/"
            className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="/#pricing"
            className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
          >
            Pricing
          </Link>

          {!session?.user && (
            <Link
              href="/#pricing"
              className="text-xl font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
            >
              Get Started
            </Link>
          )}

          {session?.user && (
            <>
              <Link
                href="/resume/display"
                className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                My Resume
              </Link>
              <Link
                href="/history"
                className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                History
              </Link>
              <Link
                href="/custom-resume"
                className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                Make Custom Resume
              </Link>

              {isAdminOrManager && (
                <Link
                  href="/dashboard"
                  className="font-semibold px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </>
          )}
        </div>

        <div className="items-center hidden space-x-4 md:flex">
          {session?.user ? (
            <>
              <Link
                href="/settings"
                className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="font-semibold text-sm text-gray-100 px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="font-semibold text-sm px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
            >
              Sign Up / Sign In
            </Link>
          )}
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="mt-4 space-y-2 md:hidden">
          <Link
            href="/"
            className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#pricing"
            className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
          >
            Pricing
          </Link>

          {!session?.user && (
            <Link
              href="/#pricing"
              className="block text-xl font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors mt-4"
            >
              Get Started
            </Link>
          )}

          {session?.user && (
            <>
              <Link
                href="/resume/display"
                className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                My Resume
              </Link>
              <Link
                href="/history"
                className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                History
              </Link>
              <Link
                href="/custom-resume"
                className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                Make Custom Resume
              </Link>

              {isAdminOrManager && (
                <Link
                  href="/dashboard"
                  className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </>
          )}

          {session?.user ? (
            <>
              <Link
                href="/settings"
                className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block text-sm font-semibold leading-loose text-gray-100 px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="block text-sm font-semibold leading-loose px-3 py-1 rounded-full hover:bg-violet-600 transition-colors"
            >
              Sign Up / Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
