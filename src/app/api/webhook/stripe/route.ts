import { NextRequest, NextResponse } from 'next/server'
import { verifyStripeWebhookSignature, stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { recordSubscriptionPurchase } from '@/lib/actions/subscription'
import { SubscriptionStatus } from '@prisma/client'
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

// Mock function for development mode to avoid Stripe API calls
const mockRetrieveSubscription = (subscriptionId: string) => {
  console.log(
    `[DEV] Mocking Stripe subscription retrieval for: ${subscriptionId}`
  )
  return {
    id: subscriptionId,
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    items: {
      data: [
        {
          price: {
            id: process.env.STRIPE_PRICE_ID || 'price_test',
            recurring: {
              interval: 'month',
            },
          },
        },
      ],
    },
  }
}

// Mock subscription type that matches the fields we need
type MockSubscription = {
  id: string
  status: string
  current_period_start: number
  current_period_end: number
  items: {
    data: Array<{
      price: {
        id: string
        recurring?: {
          interval: string
        }
      }
    }>
  }
}

// This is the webhook handler for Stripe events
export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const rawBody = await req.text()
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature') || ''

    console.log('Webhook request received:')
    console.log('- Signature header length:', signature.length)
    console.log('- Raw body length:', rawBody.length)
    console.log('- First 50 chars of body:', rawBody.substring(0, 50))
    console.log('- NODE_ENV:', process.env.NODE_ENV)

    let event
    // In development, try parsing without verification first
    if (process.env.NODE_ENV === 'development') {
      try {
        // First try parsing the event directly
        event = JSON.parse(rawBody)
        console.log('DEV MODE: Parsed event without verification')

        // Extra validation - check if it looks like a Stripe event
        if (!event || !event.type || !event.data || !event.data.object) {
          console.error(
            'DEV MODE: Parsed event lacks required Stripe event structure'
          )
          // Fall back to verification
          event = null
        } else {
          console.log(
            `DEV MODE: Successfully parsed event of type: ${event.type}`
          )
        }
      } catch (parseError) {
        console.error('DEV MODE: Could not parse event body:', parseError)
        // Fall back to verification
        event = null
      }
    }

    // If we don't have an event yet, try verification
    if (!event) {
      if (!signature) {
        console.log('Missing Stripe signature')
        return NextResponse.json(
          { error: 'Missing Stripe signature' },
          { status: 400 }
        )
      }

      try {
        // Verify the signature
        event = await verifyStripeWebhookSignature(rawBody, signature)
        console.log(`Verified Stripe webhook event: ${event.type}`)
      } catch (error) {
        console.error('Webhook verification failed:', error)
        return NextResponse.json(
          { error: 'Webhook verification failed' },
          { status: 400 }
        )
      }
    }

    console.log(`Processing Stripe webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(
          `Processing checkout.session.completed event, mode: ${session.mode}`
        )

        // Extract user ID and customer ID
        const userId = session.client_reference_id || session.metadata?.userId
        const customerId = session.customer as string
        const metadata = session.metadata || {}
        const productType =
          session.metadata?.productType || session.metadata?.product || ''

        console.log(
          `Found userId: ${userId}, customerId: ${customerId}, productType: ${productType}`
        )

        if (!userId || !customerId) {
          console.log('Missing userId or customerId')
          return NextResponse.json(
            { error: 'Missing userId or customerId' },
            { status: 400 }
          )
        }

        try {
          // Handle subscription (subscription mode)
          if (session.mode === 'subscription') {
            console.log('Handling subscription mode')
            const subscriptionId = session.subscription as string

            // Retrieve the subscription from Stripe
            let subscription: Stripe.Subscription | MockSubscription

            try {
              if (process.env.NODE_ENV === 'development') {
                // In development, mock the subscription retrieval
                subscription = mockRetrieveSubscription(subscriptionId)
              } else {
                // In production, call the real Stripe API
                subscription = await stripe.subscriptions.retrieve(
                  subscriptionId
                )
              }
              console.log(`Retrieved subscription with ID: ${subscriptionId}`)
            } catch (retrievalError) {
              console.error(
                'Error retrieving subscription, using fallback:',
                retrievalError
              )
              // Use a fallback subscription object if retrieval fails
              subscription = {
                id: subscriptionId,
                status: 'active',
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end:
                  Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
                items: {
                  data: [
                    {
                      price: {
                        id: process.env.STRIPE_PRICE_ID || 'price_test',
                        recurring: {
                          interval: 'month',
                        },
                      },
                    },
                  ],
                },
              }
            }

            // Calculate end date based on subscription
            const endTimestamp = subscription.current_period_end * 1000
            const endDate = new Date(endTimestamp)

            // Get the line items to determine price ID
            console.log(`Getting line items for session: ${session.id}`)
            let priceId = ''

            try {
              const lineItems = await stripe.checkout.sessions.listLineItems(
                session.id
              )
              priceId =
                lineItems.data[0]?.price?.id ||
                process.env.STRIPE_PRICE_ID_MONTHLY ||
                ''
            } catch (lineItemsError) {
              console.error(
                'Error getting line items, using fallback price ID:',
                lineItemsError
              )
              priceId =
                process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly_test'
            }

            console.log(
              `Recording monthly subscription purchase with price ID: ${priceId}`
            )

            // Record the purchase with subscription details
            try {
              const result = await recordSubscriptionPurchase({
                userId: userId as string,
                subscriptionId: subscription.id,
                customerId: customerId as string,
                priceId,
                sessionId: session.id,
                endDate,
              })

              console.log(`Subscription purchase result:`, result)

              // Double-check the user was updated correctly
              const updatedUser = await prisma.user.findUnique({
                where: { id: userId as string },
                select: {
                  subscription_plan: true,
                  subscription_status: true,
                  credits: true,
                },
              })

              console.log(`User after subscription update:`, updatedUser)
            } catch (purchaseError) {
              console.error(
                'Error recording subscription purchase:',
                purchaseError
              )
              return NextResponse.json(
                {
                  error: 'Error recording subscription purchase',
                  details: String(purchaseError),
                },
                { status: 500 }
              )
            }
          }
          // Handle yearly plan (payment mode)
          else if (
            (session.mode === 'payment' &&
              (productType === 'yearly' ||
                metadata?.productType === 'yearly')) ||
            productType === 'yearly'
          ) {
            // Calculate end date (1 year from now)
            const endDate = new Date()
            endDate.setFullYear(endDate.getFullYear() + 1)

            // Get the line items to determine price ID
            console.log(`Getting line items for session: ${session.id}`)
            const lineItems = await stripe.checkout.sessions.listLineItems(
              session.id
            )
            const priceId =
              lineItems.data[0]?.price?.id ||
              process.env.STRIPE_PRICE_ID_YEAR ||
              ''

            console.log(
              `Recording yearly subscription purchase with price ID: ${priceId}`
            )

            // Record the purchase as a yearly subscription
            const result = await recordSubscriptionPurchase({
              userId: userId as string,
              subscriptionId: 'one-time-' + session.id, // Use a prefix to indicate it's not a recurring subscription
              customerId: customerId as string,
              priceId,
              sessionId: session.id,
              endDate,
            })

            console.log(`Yearly subscription purchase result:`, result)

            // Double-check the user was updated correctly
            const updatedUser = await prisma.user.findUnique({
              where: { id: userId as string },
              select: {
                subscription_plan: true,
                subscription_status: true,
                credits: true,
              },
            })

            console.log(`User after yearly subscription update:`, updatedUser)
          }
          // Handle additional credits purchase (payment mode)
          else if (
            (session.mode === 'payment' &&
              (productType === 'additional_credits' ||
                metadata?.productType === 'additionalCredits' ||
                productType === 'additionalCredits')) ||
            productType === 'additional_credits' ||
            productType === 'additionalCredits'
          ) {
            // Find the purchase record to get the credits amount
            console.log(`Finding purchase record for session: ${session.id}`)
            const purchase = await prisma.purchase.findUnique({
              where: { stripe_session_id: session.id },
              select: { credits_added: true },
            })

            const creditsToAdd = purchase?.credits_added || 200

            // Find the user
            const user = await prisma.user.findUnique({
              where: { id: userId as string },
              select: { credits: true },
            })

            console.log(
              `Adding ${creditsToAdd} credits to user with current credits: ${user?.credits}`
            )

            // Add the credits to the user's account
            await prisma.user.update({
              where: { id: userId as string },
              data: {
                credits: (user?.credits || 0) + creditsToAdd,
              },
            })

            // Update the purchase record status
            await prisma.purchase.update({
              where: { stripe_session_id: session.id },
              data: { status: 'completed' },
            })

            // Double-check the user was updated correctly
            const updatedUser = await prisma.user.findUnique({
              where: { id: userId as string },
              select: { credits: true },
            })

            console.log(`User after credits update:`, updatedUser)
          } else {
            console.log(
              `Unhandled checkout session mode: ${session.mode} with productType: ${productType}`
            )
            return NextResponse.json(
              {
                error: 'Unhandled checkout session mode',
                mode: session.mode,
                productType,
              },
              { status: 400 }
            )
          }
        } catch (processingError) {
          console.error('Error processing webhook:', processingError)
          return NextResponse.json(
            {
              error: 'Error processing webhook',
              details:
                processingError instanceof Error
                  ? processingError.message
                  : String(processingError),
            },
            { status: 500 }
          )
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
