import Stripe from 'stripe'

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  // Force a valid API version for TypeScript compatibility
  // @ts-expect-error - Stripe API version compatibility
  apiVersion: '2023-10-16',
  typescript: true,
})

// Verify that a webhook event is from Stripe
export async function verifyStripeWebhookSignature(
  body: string,
  signature: string
) {
  try {
    console.log('Verifying Stripe webhook signature...')
    console.log(
      'Webhook secret: ',
      process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set'
    )

    // Create the event from the raw body and signature using the webhook secret
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Webhook signature verification failed:', errorMessage)
    console.error('Signature provided:', signature)
    console.error('First 100 chars of body:', body.substring(0, 100))
    throw new Error(`Webhook signature verification failed: ${errorMessage}`)
  }
}

// Create a Stripe checkout session for subscriptions
export async function createCheckoutSession({
  priceId,
  customerId,
  userId,
  mode = 'subscription',
  productType,
}: {
  priceId: string
  customerId?: string
  userId: string
  mode?: 'subscription' | 'payment'
  productType?: 'monthly' | 'yearly' | 'additional_credits'
}) {
  // Use environment variable for the origin or default to localhost
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3200'

  return await stripe.checkout.sessions.create({
    mode,
    customer: customerId,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    payment_method_types: ['card'],
    success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
    metadata: {
      userId,
      productType: productType || '',
    },
  })
}

// Get or create a Stripe customer for a user
export async function getOrCreateStripeCustomer(userId: string, email: string) {
  // Check if user already has a stripe_customer_id
  const { prisma } = await import('./prisma')
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripe_customer_id: true },
  })

  // If they do, try to fetch the customer from Stripe to verify it exists
  if (user?.stripe_customer_id) {
    try {
      // Verify the customer exists in Stripe
      await stripe.customers.retrieve(user.stripe_customer_id)
      return user.stripe_customer_id
    } catch (error) {
      console.log(
        'Customer not found in Stripe, creating new one:',
        error instanceof Error ? error.message : String(error)
      )
      // Customer doesn't exist in Stripe, continue to create a new one
    }
  }

  // Create a new customer in Stripe
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })

  // Save the customer ID to the user record
  await prisma.user.update({
    where: { id: userId },
    data: { stripe_customer_id: customer.id },
  })

  return customer.id
}

// Retrieve a Stripe subscription
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

// Cancel a Stripe subscription
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}
