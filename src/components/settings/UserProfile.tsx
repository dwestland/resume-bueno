'use client'

import Image from 'next/image'

interface UserProfileProps {
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile</h2>

      <div className="flex items-start space-x-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'Profile picture'}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 text-2xl font-semibold">
              {user.name?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                '?'}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Name
              </label>
              <p className="text-lg font-medium">{user.name || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
