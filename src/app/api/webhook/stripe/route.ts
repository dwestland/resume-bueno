import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CustomerStatus, PurchaseType, PurchaseStatus } from '@prisma/client'
import Stripe from 'stripe'

// Initialize Stripe without specifying the API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const runtime = 'nodejs'

/**
 * This webhook handler processes Stripe events to:
 * 1. Record new purchases
 * 2. Update user subscription status
 * 3. Add credits to user accounts
 */
export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Log the event for debugging
  try {
    await prisma.webhookEventLog.create({
      data: {
        stripe_event_id: event.id,
        event_type: event.type,
        stripe_object_id:
          'id' in event.data.object ? (event.data.object.id as string) : null,
        user_id:
          'customer' in event.data.object
            ? (event.data.object.customer as string)
            : 'unknown',
        payload: JSON.stringify(event),
      },
    })
  } catch (err) {
    console.error('Failed to log webhook event:', err)
    // Continue processing even if logging fails
  }

  // Process the event
  console.log(`===== STRIPE WEBHOOK =====`)
  console.log(`Event type: ${event.type}`)

  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      )
    } else if (event.type === 'invoice.paid') {
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
    } else if (event.type === 'customer.subscription.updated') {
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
    } else if (event.type === 'customer.subscription.deleted') {
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      {
        error: 'Error processing webhook',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout session completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const customerId = session.customer as string
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`)
    return
  }

  console.log(`Processing checkout for user ${user.email}`)

  // Record the purchase
  await recordPurchase(session, user.id)
}

/**
 * Handle invoice paid event
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`)
    return
  }

  console.log(`Processing invoice payment for user ${user.email}`)

  // Add credits based on the subscription
  // This would be if you're running a subscription model that gives credits periodically
  await updateUserCredits(user.id, 200) // Add 200 credits
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`)
    return
  }

  console.log(`Updating subscription for user ${user.email}`)

  // Update user's subscription status
  const status =
    subscription.status === 'active'
      ? CustomerStatus.ACTIVE
      : subscription.status === 'canceled'
      ? CustomerStatus.CANCELED
      : subscription.status === 'unpaid'
      ? CustomerStatus.EXPIRED
      : CustomerStatus.INACTIVE

  await prisma.user.update({
    where: { id: user.id },
    data: { subscription_status: status },
  })
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const user = await prisma.user.findFirst({
    where: { stripe_customer_id: customerId },
  })

  if (!user) {
    console.error(`User not found for Stripe customer ID: ${customerId}`)
    return
  }

  console.log(`Canceling subscription for user ${user.email}`)

  // Update user's subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: { subscription_status: CustomerStatus.CANCELED },
  })
}

/**
 * Record a purchase in the database
 */
async function recordPurchase(
  session: Stripe.Checkout.Session,
  userId: string
) {
  // Extract line items to determine what was purchased
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

  if (!lineItems.data.length) {
    console.error('No line items found in session')
    return
  }

  const item = lineItems.data[0]
  const priceId = item.price?.id

  if (!priceId) {
    console.error('No price ID found in line item')
    return
  }

  // Determine the purchase type based on the price ID
  let purchaseType: PurchaseType = PurchaseType.MONTHLY_SUBSCRIPTION
  const creditsToAdd = 200

  if (priceId === process.env.STRIPE_PRICE_ID_YEAR) {
    purchaseType = PurchaseType.YEAR_PURCHASE
  } else if (priceId === process.env.STRIPE_PRICE_ID_ADDITIONAL_CREDITS) {
    purchaseType = PurchaseType.ADDITIONAL_CREDITS
  }

  // Calculate subscription dates
  const startDate = new Date()
  let endDate: Date | null = new Date()

  if (purchaseType === PurchaseType.MONTHLY_SUBSCRIPTION) {
    endDate.setMonth(endDate.getMonth() + 1)
  } else if (purchaseType === PurchaseType.YEAR_PURCHASE) {
    endDate.setFullYear(endDate.getFullYear() + 1)
  } else {
    // For one-time purchases, no subscription period
    endDate = null
  }

  // Begin transaction
  console.log(`Recording ${purchaseType} purchase for user ${userId}`)
  console.log(`Adding ${creditsToAdd} credits`)

  try {
    // Create the purchase record and update user in a transaction
    const [purchase, updatedUser] = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          user_id: userId,
          amount_paid: item.amount_total ? item.amount_total / 100 : 0,
          purchase_type: purchaseType,
          purchase_status: PurchaseStatus.COMPLETED,
          subscription_start: startDate,
          subscription_end: endDate,
          credits_added: creditsToAdd,
          stripe_session_id: session.id,
          stripe_payment_id: (session.payment_intent as string) || null,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscription_status: CustomerStatus.ACTIVE,
          credits: {
            increment: creditsToAdd,
          },
        },
      }),
    ])

    console.log(`Successfully recorded purchase ${purchase.id}`)
    console.log(`User now has ${updatedUser.credits} credits`)

    // Update the webhook event log to mark it as processed
    await prisma.webhookEventLog.updateMany({
      where: { stripe_event_id: session.id },
      data: {
        processed: true,
        processed_at: new Date(),
      },
    })
  } catch (error) {
    console.error('Error recording purchase:', error)
    throw error
  }
}

/**
 * Update a user's credit balance
 */
async function updateUserCredits(userId: string, creditsToAdd: number) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: creditsToAdd,
        },
      },
    })

    console.log(`Added ${creditsToAdd} credits to user ${userId}`)
    console.log(`User now has ${updatedUser.credits} credits`)
  } catch (error) {
    console.error('Error updating user credits:', error)
    throw error
  }
}
