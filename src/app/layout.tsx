import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Next.js Supabase Template',
    template: '%s | Next.js Supabase Template',
  },
  description: 'A production-ready Next.js template with Supabase, Stripe, and more.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
