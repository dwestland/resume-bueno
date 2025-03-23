import type { Metadata } from 'next'
import { Oswald } from 'next/font/google'
import './globals.css'
import { UserBanner } from '@/components/UserBanner'
import { SessionProvider } from '@/components/SessionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import EnvironmentIndicator from '@/components/EnvironmentIndicator'
import AnalyticsWrapper from '@/components/AnalyticsWrapper'

// Import Google Fonts
const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Resume + Job Description = Resume Bueno',
  description:
    'Upload your resume, add a job description and let Resume Bueno do the rest. Get a matching resume, job evaluation and a cover letter. Try it now for FREE!',
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
          <AnalyticsWrapper />
          <Header />
          <UserBanner />
          {EnvironmentIndicator && <EnvironmentIndicator />}
          <main className="container max-w-screen-xl flex-grow">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
