import React from 'react'
import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="container p-4 mx-auto">
      <div>
        {' '}
        {/* Apply container class here */}
        {/* Your footer content goes here */}
        <p className="text-center">
          <Link href="/messages">Contact Us</Link>
        </p>
        <p className="text-center">
          © {new Date().getFullYear()} ResumeBueno.com
        </p>
      </div>
    </footer>
  )
}
