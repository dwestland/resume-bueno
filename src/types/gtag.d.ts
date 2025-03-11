// Type definitions for Google Analytics gtag
interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: Record<string, unknown>
  ) => void
  dataLayer: Array<Record<string, unknown>>
}
