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
    default: 'Quality Control - Relationship Wellness',
    template: '%s | Quality Control',
  },
  description: 'A thoughtful approach to relationship wellness through regular check-ins',
  keywords: 'relationship, wellness, check-in, couples, communication',
  openGraph: {
    title: 'Quality Control - Relationship Wellness',
    description: 'A thoughtful approach to relationship wellness through regular check-ins',
    siteName: 'Quality Control',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality Control - Relationship Wellness',
    description: 'A thoughtful approach to relationship wellness through regular check-ins',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Quality Control',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen font-sans antialiased touch-manipulation">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
