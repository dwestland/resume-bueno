import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GithubIcon } from 'lucide-react'

export default async function SignInPage() {
  const session = await auth()

  // Redirect to home if already logged in
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Welcome to Resume Bueno
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Sign Up / Sign In to Get Started
          </p>
        </div>

        <div className="mt-10 bg-white p-8 shadow-lg rounded-xl border border-gray-100">
          <div className="space-y-4">
            <form
              action={async () => {
                'use server'
                await signIn('github', { redirectTo: '/' })
              }}
              className="w-full"
            >
              <Button
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800"
                size="lg"
              >
                <GithubIcon className="h-5 w-5" />
                Continue with GitHub
              </Button>
            </form>

            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/' })
              }}
            >
              <Button
                className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800"
                size="lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form
              action={async (formData: FormData) => {
                'use server'
                const email = formData.get('email')
                if (typeof email !== 'string' || !email) {
                  throw new Error('Missing email from request body.')
                }
                await signIn('resend', { email, redirectTo: '/' })
              }}
              className="space-y-4 mt-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-[#0a0a0a]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500"
                size="lg"
              >
                Sign in with Email
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a
            href="#"
            className="font-medium text-violet-600 hover:text-violet-500"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
            className="font-medium text-violet-600 hover:text-violet-500"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
