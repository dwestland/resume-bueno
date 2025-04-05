import { NextResponse } from 'next/server'
import { testRecordSubscriptionPurchase } from '@/lib/actions/subscription'

export const runtime = 'nodejs'

/**
 * Test endpoint for simulating a subscription purchase
 * This helps with debugging and testing without having to go through Stripe
 */
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const planType =
      (url.searchParams.get('plan') as
        | 'monthly'
        | 'yearly'
        | 'additional-credits') || 'monthly'

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Execute the test purchase
    const result = await testRecordSubscriptionPurchase({
      userId,
      planType: planType || 'monthly',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recorded ${planType} purchase for user ${userId}`,
      data: result,
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json(
      {
        error: 'Error processing test purchase',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
