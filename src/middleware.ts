import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle CORS preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return NextResponse.json(
      {},
      {
        headers: {
          'Access-Control-Allow-Origin': '*', // Or specific origins you want to allow
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400', // 24 hours
        },
      }
    )
  }

  // Check for the session cookie
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value

  // Define the routes to protect.
  const protectedRoutes = [
    '/custom-resume',
    '/history',
    '/resume/add',
    '/resume/display',
    '/resume/edit',
    '/settings',
  ]

  // Check if the current request matches any of the protected routes.
  const isProtected = protectedRoutes.some(
    (route) => request.nextUrl.pathname === route
  )

  // No session found for a protected route, redirecting to Sign-In
  if (isProtected && !sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Add CORS headers to all responses (for non-OPTIONS requests)
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*') // Or specific origins
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )

  return response
}

// Executes middleware on all routes except api and trpc
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
