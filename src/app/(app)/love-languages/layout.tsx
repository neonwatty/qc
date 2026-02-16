'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

const TABS = [
  { href: '/love-languages', label: 'Languages' },
  { href: '/love-languages/actions', label: 'Actions' },
] as const

export default function LoveLanguagesLayout({ children }: LayoutProps): ReactNode {
  const pathname = usePathname()

  function isActive(href: string): boolean {
    if (href === '/love-languages') {
      return pathname === '/love-languages'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Love Languages</h1>

      <nav className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-colors',
              isActive(tab.href)
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
