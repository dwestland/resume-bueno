'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import GoogleAnalytics from './GoogleAnalytics'

// Silent fallback that doesn't show any error UI
function FallbackComponent() {
  return null
}

// Loading component that doesn't display anything
function AnalyticsLoading() {
  return null
}

// Main analytics wrapper component
export default function AnalyticsWrapper() {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Suspense fallback={<AnalyticsLoading />}>
        <GoogleAnalytics />
      </Suspense>
    </ErrorBoundary>
  )
}
