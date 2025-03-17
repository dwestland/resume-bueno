import { NextRequest, NextResponse } from 'next/server'
import { testRecordSubscriptionPurchase } from '@/lib/actions/subscription'

// This is a test endpoint - should be removed in production
export async function GET(req: NextRequest) {
  // Only enable this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    )
  }

  try {
    // Get the user ID from the query string
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Record the subscription purchase
    const result = await testRecordSubscriptionPurchase(userId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ error: 'Test endpoint failed' }, { status: 500 })
  }
}
