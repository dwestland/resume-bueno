// Extend Stripe's available API versions
declare module 'stripe' {
  namespace Stripe {
    interface StripeConstructorOptions {
      apiVersion?: string
    }
  }
}
