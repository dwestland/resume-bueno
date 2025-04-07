import Stripe from 'stripe'

// Initialize Stripe with the latest API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-expect-error - Vercel build environment has a different Stripe version that doesn't support 2025-01-27.acacia
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'Resume Bueno',
    version: '1.0.0',
  },
})

export type StripeProductType = 'monthly' | 'year' | 'additional-credits'

// Map of environment variables to price IDs
export const STRIPE_PRICE_IDS: Record<StripeProductType, string> = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  year: process.env.STRIPE_PRICE_ID_YEAR!,
  'additional-credits': process.env.STRIPE_PRICE_ID_ADDITIONAL_CREDITS!,
}

// Map product types to database purchase types
export const PURCHASE_TYPE_MAP: Record<
  StripeProductType,
  'MONTHLY_SUBSCRIPTION' | 'YEAR_PURCHASE' | 'ADDITIONAL_CREDITS'
> = {
  monthly: 'MONTHLY_SUBSCRIPTION',
  year: 'YEAR_PURCHASE',
  'additional-credits': 'ADDITIONAL_CREDITS',
}

// Define credits added for each product
export const CREDITS_PER_PRODUCT: Record<StripeProductType, number> = {
  monthly: 200, // 200 credits per month
  year: 2400, // 200 credits per month * 12 months
  'additional-credits': 200, // 200 additional credits
}

// Get product duration information based on type
export function getProductDuration(productType: StripeProductType): {
  start: Date
  end: Date | null
  validUntil: Date | null
} {
  const now = new Date()

  switch (productType) {
    case 'monthly':
      const endDate = new Date(now)
      endDate.setMonth(now.getMonth() + 1)
      return {
        start: now,
        end: endDate,
        validUntil: null,
      }

    case 'year':
      const validUntil = new Date(now)
      validUntil.setFullYear(now.getFullYear() + 1)
      return {
        start: now,
        end: null,
        validUntil,
      }

    case 'additional-credits':
      return {
        start: now,
        end: null,
        validUntil: null,
      }
  }
}

// Product details for UI display
export const PRODUCT_DETAILS: Record<
  StripeProductType,
  {
    name: string
    description: string
    price: string
  }
> = {
  monthly: {
    name: 'Monthly Subscription',
    description: 'Monthly subscription with 200 credits per month',
    price: '$9.95/month',
  },
  year: {
    name: 'Yearly Purchase',
    description: '2400 credits valid for 1 year',
    price: '$45.00/year',
  },
  'additional-credits': {
    name: 'Additional Credits',
    description: '200 additional credits',
    price: '$9.95',
  },
}
