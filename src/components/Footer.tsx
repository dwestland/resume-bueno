import React from 'react'
import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="container mx-auto p-4">
      <div>
        {' '}
        {/* Apply container class here */}
        {/* Your footer content goes here */}
        <p className="text-center">
          <Link href="/messages">Contact Us</Link>
        </p>
        <p className="text-center">© 2023 My Website</p>
      </div>
    </footer>
  )
}
