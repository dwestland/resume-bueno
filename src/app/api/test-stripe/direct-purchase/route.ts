import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PurchaseType } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Get the query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const plan = url.searchParams.get('plan') || 'monthly'

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

    // Prepare data based on plan type
    const creditsToAdd = 200
    let purchaseType: PurchaseType = PurchaseType.MONTHLY_SUBSCRIPTION
    let amount = 9.95
    let startDate: Date | null = new Date()
    let endDate: Date | null = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    if (plan === 'yearly') {
      purchaseType = PurchaseType.YEAR_PURCHASE
      amount = 45
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (plan === 'additional-credits') {
      purchaseType = PurchaseType.ADDITIONAL_CREDITS
      amount = 9.95
      startDate = null
      endDate = null
    }

    // Transaction to create purchase record and update user
    const [purchase, updatedUser] = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          user_id: userId,
          amount_paid: amount,
          purchase_type: purchaseType,
          purchase_status: 'COMPLETED',
          subscription_start: startDate,
          subscription_end: endDate,
          credits_added: creditsToAdd,
          stripe_payment_id: `test-${Date.now()}`,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          subscription_status: 'ACTIVE',
          credits: {
            increment: creditsToAdd,
          },
        },
        select: {
          id: true,
          email: true,
          subscription_status: true,
          credits: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      purchase,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error performing direct purchase:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
