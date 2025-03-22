'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
  createCheckoutSession,
  getOrCreateStripeCustomer,
  cancelSubscription,
} from '@/lib/stripe'
import {
  PurchaseType,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { SubscriptionType } from '@/lib/types/subscription'

/**
 * Function to create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(
  planType: SubscriptionType
): Promise<{ url: string | null; error?: string }> {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return { url: null, error: 'User not authenticated' }
    }

    const userId = session.user.id
    const email = session.user.email

    // Get or create a Stripe customer for the user
    const customerId = await getOrCreateStripeCustomer(userId, email)

    // Determine which price ID to use based on the plan type
    const priceId =
      planType === SubscriptionType.MONTHLY
        ? process.env.STRIPE_PRICE_ID_MONTHLY
        : process.env.STRIPE_PRICE_ID_YEAR

    if (!priceId) {
      return {
        url: null,
        error: 'Price ID not found for the selected plan',
      }
    }

    // Yearly plan is a one-time payment, monthly is a subscription
    const mode =
      planType === SubscriptionType.YEARLY ? 'payment' : 'subscription'

    // Set the product type for metadata
    const productType =
      planType === SubscriptionType.MONTHLY ? 'monthly' : 'yearly'

    // Create the checkout session
    const checkoutSession = await createCheckoutSession({
      priceId,
      customerId,
      userId,
      mode,
      productType,
    })

    // Record the pending purchase in the database
    await prisma.purchase.create({
      data: {
        user_id: userId,
        amount: planType === SubscriptionType.MONTHLY ? 9.95 : 45,
        purchase_type:
          planType === SubscriptionType.MONTHLY
            ? PurchaseType.SUBSCRIPTION_MONTHLY
            : PurchaseType.SUBSCRIPTION_YEARLY,
        stripe_session_id: checkoutSession.id,
        status: 'pending',
      },
    })

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return {
      url: null,
      error: 'Failed to create checkout session',
    }
  }
}

/**
 * Function to record a successful subscription purchase
 */
export async function recordSubscriptionPurchase({
  userId,
  subscriptionId,
  customerId,
  priceId,
  sessionId,
  endDate,
}: {
  userId: string
  subscriptionId: string
  customerId: string
  priceId: string
  sessionId: string
  endDate: Date
}) {
  try {
    console.log(`Recording subscription purchase for user: ${userId}`)
    console.log(`- Subscription ID: ${subscriptionId}`)
    console.log(`- Customer ID: ${customerId}`)
    console.log(`- Price ID: ${priceId}`)
    console.log(`- Session ID: ${sessionId}`)
    console.log(`- End Date: ${endDate.toISOString()}`)

    // Determine the subscription plan based on price ID
    const isMonthly = priceId === process.env.STRIPE_PRICE_ID_MONTHLY
    const plan = isMonthly ? SubscriptionPlan.MONTHLY : SubscriptionPlan.YEARLY

    console.log(`- Determined plan type: ${plan}`)
    console.log(`- Plan is monthly: ${isMonthly}`)
    console.log(`- MONTHLY price ID: ${process.env.STRIPE_PRICE_ID_MONTHLY}`)
    console.log(`- YEARLY price ID: ${process.env.STRIPE_PRICE_ID_YEAR}`)

    // Update the user's subscription information
    console.log('Updating user subscription information...')

    const updateResult = await prisma.user.update({
      where: { id: userId },
      data: {
        stripe_customer_id: customerId,
        subscription_id: subscriptionId,
        subscription_plan: plan,
        subscription_status: SubscriptionStatus.ACTIVE,
        subscription_start: new Date(),
        subscription_end: endDate,
        // Reset credits to 200 when subscribing or renewing
        credits: 200,
      },
    })

    console.log('User update completed:')
    console.log(`- New subscription plan: ${updateResult.subscription_plan}`)
    console.log(
      `- New subscription status: ${updateResult.subscription_status}`
    )
    console.log(`- New credits: ${updateResult.credits}`)

    // Update the purchase record
    console.log('Updating purchase record status...')

    await prisma.purchase.update({
      where: { stripe_session_id: sessionId },
      data: {
        status: 'completed',
      },
    })

    console.log('Purchase record updated to completed')

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error recording subscription purchase:', error)
    return { success: false, error: 'Failed to record subscription' }
  }
}

/**
 * Function to cancel a user's subscription
 */
export async function cancelUserSubscription(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    const userId = session.user.id

    // Fetch the user's subscription details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_id: true,
        subscription_status: true,
      },
    })

    // If no subscription found or already canceled, return early
    if (
      !user?.subscription_id ||
      user.subscription_status === SubscriptionStatus.CANCELED
    ) {
      return { success: false, error: 'No active subscription found' }
    }

    // Cancel the subscription in Stripe
    await cancelSubscription(user.subscription_id)

    // Update the user's subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription_status: SubscriptionStatus.CANCELED,
      },
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { success: false, error: 'Failed to cancel subscription' }
  }
}

/**
 * Function to check a user's subscription status
 */
export async function checkSubscriptionStatus(): Promise<{
  isSubscribed: boolean
  plan: string | null
  endDate: Date | null
  status: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        isSubscribed: false,
        plan: null,
        endDate: null,
        status: 'Not authenticated',
      }
    }

    const userId = session.user.id

    // Get the user's subscription details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_plan: true,
        subscription_status: true,
        subscription_end: true,
      },
    })

    // If no user or subscription, return not subscribed
    if (!user) {
      return {
        isSubscribed: false,
        plan: null,
        endDate: null,
        status: 'User not found',
      }
    }

    // Check if the subscription is active
    const isActive = user.subscription_status === SubscriptionStatus.ACTIVE
    const isExpired = user.subscription_end
      ? new Date() > user.subscription_end
      : true

    return {
      isSubscribed: isActive && !isExpired,
      plan:
        user.subscription_plan === SubscriptionPlan.NONE
          ? null
          : user.subscription_plan,
      endDate: user.subscription_end,
      status: user.subscription_status,
    }
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return {
      isSubscribed: false,
      plan: null,
      endDate: null,
      status: 'Error',
    }
  }
}

/**
 * Function to manually replenish a user's credits (for testing)
 */
export async function replenishCredits(): Promise<{
  success: boolean
  credits?: number
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    const userId = session.user.id

    // Update the user's credits
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: 200, // Reset to 200 credits
      },
      select: {
        credits: true,
      },
    })

    revalidatePath('/')
    return { success: true, credits: updatedUser.credits }
  } catch (error) {
    console.error('Error replenishing credits:', error)
    return { success: false, error: 'Failed to replenish credits' }
  }
}

/**
 * Function to get a user's purchase history
 */
export async function getUserPurchaseHistory() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated', purchases: [] }
    }

    const userId = session.user.id

    // Get the user's purchase history
    const purchases = await prisma.purchase.findMany({
      where: {
        user_id: userId,
        status: 'completed',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, purchases }
  } catch (error) {
    console.error('Error getting purchase history:', error)
    return {
      success: false,
      error: 'Failed to get purchase history',
      purchases: [],
    }
  }
}

/**
 * Function to get a user's credits
 */
export async function getUserCredits(): Promise<{
  success: boolean
  credits?: number
  error?: string
}> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'User not authenticated' }
    }

    const userId = session.user.id

    // Get the user's credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, credits: user.credits }
  } catch (error) {
    console.error('Error getting user credits:', error)
    return { success: false, error: 'Failed to get user credits' }
  }
}

/**
 * Replenish credits for yearly plan users
 * This function should be called by a cron job or scheduled task on the first day of each month
 */
export async function replenishYearlyPlanCredits(): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  try {
    // Get all active yearly plan users
    const yearlyUsers = await prisma.user.findMany({
      where: {
        subscription_plan: 'YEARLY',
        subscription_status: 'ACTIVE',
        subscription_end: {
          gte: new Date(), // Only include users with valid subscriptions
        },
      },
    })

    // Update each user's credits to 200
    const updatePromises = yearlyUsers.map((user) =>
      prisma.user.update({
        where: { id: user.id },
        data: { credits: 200 },
      })
    )

    // Execute all updates
    await Promise.all(updatePromises)

    return {
      success: true,
      count: yearlyUsers.length,
    }
  } catch (error) {
    console.error('Error replenishing yearly plan credits:', error)
    return {
      success: false,
      error: 'Failed to replenish credits',
    }
  }
}

/**
 * Function to create a checkout session for additional credits
 * Only available to users with an active subscription
 */
export async function createAdditionalCreditsCheckout(): Promise<{
  url: string | null
  error?: string
}> {
  try {
    // Get the current user session
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return { url: null, error: 'User not authenticated' }
    }

    const userId = session.user.id
    const email = session.user.email

    // Check if the user has an active subscription
    const { isSubscribed } = await checkSubscriptionStatus()
    if (!isSubscribed) {
      return {
        url: null,
        error: 'Additional credits are only available to active subscribers',
      }
    }

    // Get or create a Stripe customer for the user
    const customerId = await getOrCreateStripeCustomer(userId, email)

    // Get the price ID for additional credits
    const priceId = process.env.STRIPE_PRICE_ID_ADDITIONAL_CREDITS
    if (!priceId) {
      return {
        url: null,
        error: 'Price ID not found for additional credits',
      }
    }

    // Create the checkout session (one-time payment)
    const checkoutSession = await createCheckoutSession({
      priceId,
      customerId,
      userId,
      mode: 'payment',
      productType: 'additional_credits',
    })

    // Record the pending purchase in the database
    await prisma.purchase.create({
      data: {
        user_id: userId,
        amount: 9.95,
        purchase_type: PurchaseType.CREDIT_PURCHASE,
        stripe_session_id: checkoutSession.id,
        status: 'pending',
        credits_added: 200, // Track how many credits this purchase adds
      },
    })

    return { url: checkoutSession.url }
  } catch (error) {
    console.error('Error creating additional credits checkout:', error)
    return {
      url: null,
      error: 'Failed to create checkout session',
    }
  }
}

/**
 * For testing purposes only - Simulate a subscription purchase without going through Stripe
 */
export async function testRecordSubscriptionPurchase(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    console.log('TEST MODE: Recording subscription purchase for user:', userId)

    // Make up some test values
    const subscriptionId = 'sub_test_' + Date.now()
    const customerId = 'cus_test_' + Date.now()
    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_test'
    const sessionId = 'cs_test_' + Date.now()

    // End date is 1 month from now
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    // Record the subscription purchase
    const result = await recordSubscriptionPurchase({
      userId,
      subscriptionId,
      customerId,
      priceId,
      sessionId,
      endDate,
    })

    console.log('TEST MODE: Result of subscription purchase:', result)

    return { success: true }
  } catch (error) {
    console.error('TEST MODE: Error recording subscription purchase:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
