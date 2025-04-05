import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserProfile } from '@/components/settings/UserProfile'

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Settings</h1>
          <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
            <p className="text-amber-700">
              Please sign in to access your settings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      image: true,
      credits: true,
      subscription_status: true,
    },
  })

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Settings</h1>
          <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
            <p className="text-red-700">User not found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-8">
        <UserProfile user={user} />
      </div>
    </div>
  )
}
