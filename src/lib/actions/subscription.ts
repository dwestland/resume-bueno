'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SubscriptionType } from '@/lib/types/subscription'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(type: SubscriptionType) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { error: 'User not authenticated' }
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Create or retrieve Stripe customer
    if (!user.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      })

      user = await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: customer.id },
      })
    }

    if (!user.stripe_customer_id) {
      return { error: 'Failed to create or retrieve Stripe customer' }
    }

    // Get price ID based on subscription type
    const priceId =
      type === SubscriptionType.YEARLY
        ? process.env.STRIPE_PRICE_ID_YEAR
        : process.env.STRIPE_PRICE_ID_MONTHLY

    if (!priceId) {
      return { error: 'Price ID not configured' }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    })

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return { error: 'Failed to create checkout session' }
  }
}

/**
 * Create a checkout session for additional credits
 */
export async function createAdditionalCreditsCheckout() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { error: 'User not authenticated' }
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { error: 'User not found' }
    }

    // Create or retrieve Stripe customer
    if (!user.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      })

      user = await prisma.user.update({
        where: { id: user.id },
        data: { stripe_customer_id: customer.id },
      })
    }

    if (!user.stripe_customer_id) {
      return { error: 'Failed to create or retrieve Stripe customer' }
    }

    // Get price ID for additional credits
    const priceId = process.env.STRIPE_PRICE_ID_ADDITIONAL_CREDITS

    if (!priceId) {
      return { error: 'Additional credits price ID not configured' }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    })

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return { error: 'Failed to create checkout session' }
  }
}
