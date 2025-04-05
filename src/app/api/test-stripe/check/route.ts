import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Get the query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Check if user exists
    const userCount = await prisma.user.count({
      where: { id: userId },
    })

    if (userCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user subscription data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription_status: true,
        credits: true,
        purchases: {
          select: {
            subscription_start: true,
            subscription_end: true,
            purchase_type: true,
            purchase_status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    })

    return NextResponse.json({
      success: true,
      userData,
    })
  } catch (error) {
    console.error('Error checking stripe data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
