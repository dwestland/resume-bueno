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

export async function getResumeProgress() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        resume: true,
        awards: true,
        certificates: true,
        education: true,
        experience: true,
        hobbies_interests: true,
        projects: true,
        skills: true,
        training: true,
        volunteering: true,
      },
    })

    if (!user) return null

    // Count completed fields (non-null values)
    const fields = [
      'resume',
      'awards',
      'certificates',
      'education',
      'experience',
      'hobbies_interests',
      'projects',
      'skills',
      'training',
      'volunteering',
    ]

    const completedFields = fields.filter(
      (field) => !!user[field as keyof typeof user]
    )
    const completionPercentage = Math.round(
      (completedFields.length / fields.length) * 100
    )

    return {
      fields: user,
      completedCount: completedFields.length,
      totalFields: fields.length,
      completionPercentage,
    }
  } catch (error) {
    console.error('Error fetching resume progress:', error)
    return null
  }
}
