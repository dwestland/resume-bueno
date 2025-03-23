'use client'

import { useEffect } from 'react'

export default function StudentSpecialPage() {
  // Effect to remove header and footer elements on mount
  useEffect(() => {
    // Get header and footer elements
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')

    // Hide them if they exist
    if (header) header.style.display = 'none'
    if (footer) footer.style.display = 'none'

    // Restore on unmount
    return () => {
      if (header) header.style.display = ''
      if (footer) footer.style.display = ''
    }
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Student Special</h1>
    </section>
  )
}
