'use server'

import { revalidatePath } from 'next/cache'
import { handleCheckoutComplete } from '../actions'
import { type SessionStatusResponse } from '@/lib/validations/checkout'

/**
 * Process a checkout session and return the result
 * @param sessionId The Stripe checkout session ID
 */
export async function processCheckoutSession(
  sessionId: string
): Promise<SessionStatusResponse> {
  // Process the checkout session
  const result = await handleCheckoutComplete(sessionId)
  return result
}

/**
 * Revalidate paths after checkout
 * This should be called client-side after checkout is processed
 */
export async function revalidateAfterCheckout(): Promise<void> {
  revalidatePath('/settings')
  revalidatePath('/')
}
