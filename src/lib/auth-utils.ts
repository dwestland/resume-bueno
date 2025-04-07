import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { type Session } from 'next-auth'

/**
 * Ensures the user is authenticated, redirects to login if not
 * @param redirectTo Path to redirect unauthenticated users
 * @returns The authenticated user's session
 */
export async function requireAuth(
  redirectTo = '/api/auth/signin'
): Promise<Session> {
  const session = await auth()

  if (!session?.user?.email) {
    redirect(redirectTo)
  }

  return session
}
