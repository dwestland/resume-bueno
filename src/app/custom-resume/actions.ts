'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function createCustomResume(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  const jobDescription = formData.get('job_description') as string
  if (!jobDescription) {
    throw new Error('Job description is required')
  }

  try {
    // Create new custom resume
    const customResume = await prisma.customResume.create({
      data: {
        job_description: jobDescription,
        users: {
          create: {
            user: {
              connect: {
                email: session.user.email,
              },
            },
          },
        },
      },
    })

    return { success: true, data: customResume }
  } catch (error) {
    console.error('Failed to create custom resume:', error)
    throw new Error('Failed to create custom resume')
  }
}
