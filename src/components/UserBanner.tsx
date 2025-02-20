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
    select: { credits: true },
  })

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <p>Hello {session.user?.name || session.user.email}</p>
        <UserCredits
          initialCredits={userRecord?.credits ?? 0}
          userEmail={session.user.email}
        />
      </div>
    </div>
  )
}
