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
  metadataBase: new URL('https://tryqc.co'),
  title: {
    default: 'QC - Quality Control for Your Relationship',
    template: '%s | QC',
  },
  description:
    'Simple tools to build a stronger relationship together. Weekly check-ins, shared notes, and growth tracking for couples.',
  keywords: 'relationship, wellness, check-in, couples, communication, love languages, relationship tools',
  openGraph: {
    title: 'QC - Quality Control for Your Relationship',
    description:
      'Simple tools to build a stronger relationship together. Weekly check-ins, shared notes, and growth tracking for couples.',
    siteName: 'QC',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QC - Quality Control for Your Relationship',
    description: 'Simple tools to build a stronger relationship together.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QC',
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
