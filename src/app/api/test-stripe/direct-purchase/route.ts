import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordSubscriptionPurchase } from '@/lib/actions/subscription'

// Test endpoint to directly call recordSubscriptionPurchase
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const plan = searchParams.get('plan') || 'monthly'

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate test IDs
    const timestamp = Date.now()
    const customerId = user.stripe_customer_id || `cus_test_${timestamp}`
    const subscriptionId = `sub_test_${timestamp}`
    const sessionId = `cs_test_${timestamp}`

    // Calculate end date based on plan
    const endDate = new Date()
    if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Update the user with a stripe customer ID if they don't have one
    if (!user.stripe_customer_id) {
      await prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: customerId },
      })
    }

    // Create a purchase record first
    console.log(`Creating purchase record for session: ${sessionId}`)
    await prisma.purchase.create({
      data: {
        user_id: userId,
        stripe_session_id: sessionId,
        amount: plan === 'yearly' ? 9900 : 990,
        currency: 'usd',
        status: 'pending',
        purchase_type:
          plan === 'yearly' ? 'SUBSCRIPTION_YEARLY' : 'SUBSCRIPTION_MONTHLY',
        credits_added: 200,
      },
    })

    console.log(`Calling recordSubscriptionPurchase with:`)
    console.log(`- userId: ${userId}`)
    console.log(`- subscriptionId: ${subscriptionId}`)
    console.log(`- customerId: ${customerId}`)
    console.log(
      `- priceId: ${
        plan === 'yearly'
          ? process.env.STRIPE_PRICE_ID_YEAR
          : process.env.STRIPE_PRICE_ID_MONTHLY
      }`
    )
    console.log(`- sessionId: ${sessionId}`)
    console.log(`- endDate: ${endDate.toISOString()}`)

    // Record the subscription purchase
    const result = await recordSubscriptionPurchase({
      userId,
      subscriptionId,
      customerId,
      priceId:
        plan === 'yearly'
          ? process.env.STRIPE_PRICE_ID_YEAR || 'price_yearly_test'
          : process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly_test',
      sessionId,
      endDate,
    })

    // Get the updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_plan: true,
        subscription_status: true,
        subscription_id: true,
        subscription_start: true,
        subscription_end: true,
        stripe_customer_id: true,
        credits: true,
      },
    })

    return NextResponse.json({
      success: true,
      result,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error in direct purchase test endpoint:', error)
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
