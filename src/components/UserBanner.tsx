import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function UserBanner() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const userRecord = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { credits: true },
  })

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <p>Hello {session.user?.name || session.user.email}</p>
        <p>
          Credits: <span>{userRecord?.credits}</span>
        </p>
      </div>
    </div>
  )
}
