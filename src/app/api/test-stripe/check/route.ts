import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Get the user's subscription details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_plan: true,
        subscription_status: true,
        subscription_start: true,
        subscription_end: true,
        subscription_id: true,
        stripe_customer_id: true,
        credits: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Test check endpoint error:', error)
    return NextResponse.json(
      { error: 'Test check endpoint failed' },
      { status: 500 }
    )
  }
}
