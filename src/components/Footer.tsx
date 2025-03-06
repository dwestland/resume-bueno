import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="container p-4 mx-auto">
      <div className="flex flex-col py-6 items-center">
        <div className="flex flex-wrap justify-center space-x-4 mb-4">
          <Link href="/about-us" className="hover:underline">
            About Us
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/accessibility" className="hover:underline">
            Accessibility
          </Link>
          <Link href="/contact-us" className="hover:underline">
            Contact Us
          </Link>
        </div>
        <p className="text-center">
          © {new Date().getFullYear()} ResumeBueno.com
        </p>
      </div>
    </footer>
  )
}
