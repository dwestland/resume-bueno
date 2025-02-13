'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function updateResume(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error('Not authenticated')
  }

  const data = {
    resume: formData.get('resume') as string,
    education: formData.get('education') as string,
    certificates: formData.get('certificates') as string,
    experience: formData.get('experience') as string,
    skills: formData.get('skills') as string,
    projects: formData.get('projects') as string,
    awards: formData.get('awards') as string,
    training: formData.get('training') as string,
    volunteering: formData.get('volunteering') as string,
    hobbies_interests: formData.get('hobbies_interests') as string,
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data,
    })
    return { success: true, data: updatedUser }
  } catch (error) {
    console.error('Failed to update resume:', error)
    throw new Error('Failed to update resume')
  }
}
