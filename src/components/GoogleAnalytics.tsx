'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// Define window.gtag for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void
    dataLayer: Record<string, unknown>[]
  }
}

const GA_MEASUREMENT_ID = 'G-5GG7NRG50X'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    try {
      // Track page views when the pathname or search parameters change
      if (!pathname || !window.gtag) return

      const fullPath =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : '')

      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: fullPath,
      })

      // For debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[GA] Tracking page view: ${fullPath}`)
      }
    } catch (error) {
      // Silently fail in production, log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[GA] Error tracking page view:', error)
      }
    }
  }, [pathname, searchParams])

  return (
    <>
      {/* Global Site Tag - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
