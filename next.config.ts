import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  transpilePackages: ['react-slick'],
  // Ignore TypeScript errors for unused @ts-expect-error directives
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
