// Extend Stripe's available API versions
declare module 'stripe' {
  namespace Stripe {
    interface StripeConstructorOptions {
      apiVersion?: '2023-10-16' | '2025-01-27.acacia' | string
    }
  }
}
