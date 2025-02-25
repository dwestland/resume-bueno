import type { Metadata } from 'next'
import { Oswald } from 'next/font/google'
import './globals.css'
import { UserBanner } from '@/components/UserBanner'
import { SessionProvider } from '@/components/SessionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Import Google Fonts
const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Resume Bueno - Build Your Resume to Any Job Instantly',
  description:
    'Stop getting overlooked! Resume Bueno transforms your resume to align with job descriptions, helping you stand out to hiring managers and ATS filters.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" spellCheck="true">
      <body
        className={`${oswald.variable} antialiased flex flex-col min-h-screen`}
      >
        <SessionProvider>
          <Header />
          <UserBanner />
          <main className="container flex-grow">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
