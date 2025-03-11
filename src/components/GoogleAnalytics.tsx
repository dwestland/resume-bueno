'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const GA_MEASUREMENT_ID = 'G-5GG7NRG50X'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track page views when the pathname or search parameters change
    if (pathname && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path:
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      })
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
