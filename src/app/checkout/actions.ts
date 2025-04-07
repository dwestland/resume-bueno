'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  stripe,
  STRIPE_PRICE_IDS,
  PURCHASE_TYPE_MAP,
  CREDITS_PER_PRODUCT,
  getProductDuration,
  type StripeProductType,
} from '@/lib/stripe'
import {
  type CheckoutResponse,
  type SessionStatusResponse,
} from '@/lib/validations/checkout'

/**
 * Creates a Stripe checkout session and returns the URL
 */
export async function createCheckoutSession(
  plan: StripeProductType,
  successUrl?: string,
  cancelUrl?: string
): Promise<CheckoutResponse> {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    // Get price information
    const priceId = STRIPE_PRICE_IDS[plan]
    if (!priceId) {
      return {
        success: false,
        error: 'Invalid plan selected',
      }
    }

    // Get or create user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stripe_customer_id: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Create Stripe customer if not exists
    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      // Update user with customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: customerId },
      })
    }

    // Default URLs if not provided
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3200'
    const defaultSuccessUrl = `${appUrl}/checkout/success`
    const defaultCancelUrl = `${appUrl}/`

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      success_url:
        successUrl || `${defaultSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || defaultCancelUrl,
      metadata: {
        userId: user.id,
        productType: plan,
      },
    })

    // Create a purchase record with PENDING status
    const duration = getProductDuration(plan)

    await prisma.purchase.create({
      data: {
        stripe_session_id: checkoutSession.id,
        user_id: user.id,
        purchase_type: PURCHASE_TYPE_MAP[plan],
        purchase_status: 'PENDING',
        stripe_price_id: priceId,
        amount_paid: 0, // Will be updated when payment is completed
        currency: 'usd', // Default currency
        credits_added: CREDITS_PER_PRODUCT[plan],
        stripe_subscription_id:
          plan === 'monthly' ? checkoutSession.subscription?.toString() : null,
        subscription_start: plan === 'monthly' ? duration.start : null,
        subscription_end: plan === 'monthly' ? duration.end : null,
        valid_until: duration.validUntil,
      },
    })

    return {
      success: true,
      url: checkoutSession.url || undefined,
      sessionId: checkoutSession.id,
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

/**
 * Handles checkout session completion (for webhook or direct check)
 */
export async function handleCheckoutComplete(
  sessionId: string
): Promise<SessionStatusResponse> {
  try {
    // Retrieve session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'subscription'],
    })

    if (!checkoutSession) {
      return {
        success: false,
        error: 'Session not found',
      }
    }

    // Return early if session is not completed
    if (checkoutSession.status !== 'complete') {
      return {
        success: true,
        status: checkoutSession.status as 'complete' | 'open' | 'expired',
        message: 'Session is not complete yet',
      }
    }

    // Get the purchase record
    const purchase = await prisma.purchase.findFirst({
      where: {
        stripe_session_id: sessionId,
      },
    })

    if (!purchase) {
      return {
        success: false,
        error: 'Purchase record not found',
      }
    }

    // Skip if already processed
    if (purchase.purchase_status === 'COMPLETED') {
      return {
        success: true,
        message: 'Session already processed',
      }
    }

    // Calculate amount paid
    const amountPaid = checkoutSession.amount_total
      ? checkoutSession.amount_total / 100 // Convert cents to dollars
      : 0

    // Update purchase record only - do not update user subscription_status or credit_balance
    // These will be updated by webhook later
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        purchase_status: 'COMPLETED',
        amount_paid: amountPaid,
        currency: checkoutSession.currency || 'usd',
        stripe_payment_id: checkoutSession.payment_intent?.toString() || null,
      },
    })

    // No longer updating user.subscription_status or user.credit_balance here
    // This will be handled by webhooks in the future

    return {
      success: true,
      message:
        'Purchase record updated successfully. Subscription status and credits will be updated when the webhook is received.',
      status: 'complete',
      paymentStatus: 'paid',
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}

/**
 * Retrieves checkout session status
 */
export async function getCheckoutSessionStatus(
  sessionId: string
): Promise<SessionStatusResponse> {
  try {
    // Retrieve session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    return {
      success: true,
      status: checkoutSession.status as 'complete' | 'open' | 'expired',
      paymentStatus: checkoutSession.payment_status as
        | 'paid'
        | 'unpaid'
        | 'no_payment_required',
    }
  } catch (error) {
    console.error('Error retrieving checkout status:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
    }
  }
}
