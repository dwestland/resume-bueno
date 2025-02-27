'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function checkUserResume() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { resume: true },
    })

    return user?.resume ? true : false
  } catch (error) {
    console.error('Error checking user resume:', error)
    return null
  }
}
