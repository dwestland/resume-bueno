import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserCredits } from './UserCredits'

export async function UserBanner() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  const userRecord = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { credit_balance: true },
  })

  return (
    <div className="container max-w-screen-xl">
      <div className="flex items-center justify-between">
        <span className="text-base mb-[-5px]">
          Hello {session.user?.name || session.user.email}
        </span>
        <UserCredits
          initialCreditBalance={userRecord?.credit_balance ?? 0}
          userEmail={session.user.email}
        />
      </div>
    </div>
  )
}
