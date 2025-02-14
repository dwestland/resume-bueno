import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import TopNav from '@/components/top-nav'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopNav />
        <main className="container">{children}</main>
      </body>
    </html>
  )
}
