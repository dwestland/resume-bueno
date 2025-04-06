import { z } from 'zod'

// Checkout request validation schema
export const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'year', 'additional-credits']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

export type CheckoutRequest = z.infer<typeof checkoutSchema>

// Checkout response validation schema
export const checkoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  url: z.string().url().optional(),
  sessionId: z.string().optional(),
})

export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>

// Checkout session status validation schema
export const sessionStatusSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  status: z.enum(['complete', 'open', 'expired']).optional(),
  paymentStatus: z.enum(['paid', 'unpaid', 'no_payment_required']).optional(),
})

export type SessionStatusResponse = z.infer<typeof sessionStatusSchema>
