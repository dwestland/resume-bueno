'use client'

import PricingSection from '@/components/PricingSection'

export default function ClientHome() {
  return (
    <div className="pricing-container">
      {/* Pricing Section */}
      <section className="pricing-section bg-gray-50">
        <PricingSection />
      </section>
      <div className="footer-accent-line w-16 h-1 bg-teal-500 mx-auto rounded mb-4"></div>
    </div>
  )
}
