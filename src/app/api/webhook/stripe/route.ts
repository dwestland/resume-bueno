import { NextRequest, NextResponse } from 'next/server'
import { verifyStripeWebhookSignature, stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { recordSubscriptionPurchase } from '@/lib/actions/subscription'
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client'
import Stripe from 'stripe'

// Type for subscription events with previous attributes
type StripeSubscriptionEvent = {
  id: string
  type: string
  data: {
    object: Stripe.Subscription
    previous_attributes?: {
      current_period_start?: number
    }
  }
}

// This is the webhook handler for Stripe events
export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const rawBody = await req.text()
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature') || ''

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    // Verify the signature
    const event = await verifyStripeWebhookSignature(rawBody, signature)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { client_reference_id: userId, customer: customerId } = session

        // Handle subscription mode (Monthly plan)
        if (session.mode === 'subscription' && userId && customerId) {
          // Get the subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Calculate end date based on subscription
          const endTimestamp = subscription.current_period_end * 1000
          const endDate = new Date(endTimestamp)

          // Record the purchase with subscription details
          await recordSubscriptionPurchase({
            userId: userId as string,
            subscriptionId: subscription.id,
            customerId: customerId as string,
            priceId: subscription.items.data[0].price.id,
            sessionId: session.id,
            endDate,
          })
        }
        // Handle one-time payment mode (Yearly plan)
        else if (session.mode === 'payment' && userId && customerId) {
          // Get the line items to determine which product was purchased
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id
          )

          // Make sure we have line items
          if (lineItems.data.length > 0) {
            const priceId = lineItems.data[0].price?.id

            // Check if this is the yearly plan price
            if (priceId && priceId === process.env.STRIPE_PRICE_ID_YEAR) {
              // Calculate end date (1 year from now)
              const endDate = new Date()
              endDate.setFullYear(endDate.getFullYear() + 1)

              // Record the purchase as a yearly subscription
              await recordSubscriptionPurchase({
                userId: userId as string,
                subscriptionId: 'one-time-' + session.id, // Use a prefix to indicate it's not a recurring subscription
                customerId: customerId as string,
                priceId: priceId,
                sessionId: session.id,
                endDate,
              })

              // Update user with yearly plan details
              await prisma.user.update({
                where: { id: userId as string },
                data: {
                  subscription_plan: SubscriptionPlan.YEARLY,
                  subscription_status: SubscriptionStatus.ACTIVE,
                  subscription_start: new Date(),
                  subscription_end: endDate,
                  credits: 200, // Reset to 200 credits
                },
              })
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        // Type cast to our custom type for this specific event
        const subscriptionEvent = event as unknown as StripeSubscriptionEvent
        const subscription = subscriptionEvent.data.object
        const { customer: customerId } = subscription

        // Check if this is a renewal by looking at previous_attributes
        const previousAttributes =
          subscriptionEvent.data.previous_attributes || {}
        const hasPeriodChanged =
          previousAttributes.current_period_start !== undefined

        // Find the user associated with this customer
        const user = await prisma.user.findFirst({
          where: {
            stripe_customer_id: customerId as string,
          },
        })

        if (user) {
          // Update subscription information
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              subscription_status:
                subscription.status === 'active'
                  ? SubscriptionStatus.ACTIVE
                  : subscription.status === 'canceled'
                  ? SubscriptionStatus.CANCELED
                  : subscription.status === 'past_due'
                  ? SubscriptionStatus.PAST_DUE
                  : SubscriptionStatus.INACTIVE,
              subscription_end: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })

          // Top up credits if in a new billing period and subscription is active
          if (subscription.status === 'active' && hasPeriodChanged) {
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                credits: 200, // Reset to 200 credits on renewal
              },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { customer: customerId } = subscription

        // Find the user associated with this customer
        const user = await prisma.user.findFirst({
          where: {
            stripe_customer_id: customerId as string,
          },
        })

        if (user) {
          // Mark subscription as canceled
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              subscription_status: SubscriptionStatus.CANCELED,
            },
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const { customer: customerId } = invoice

        // Find the user associated with this customer
        const user = await prisma.user.findFirst({
          where: {
            stripe_customer_id: customerId as string,
          },
        })

        if (user) {
          // Mark subscription as past due
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              subscription_status: SubscriptionStatus.PAST_DUE,
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return a 200 success response
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
