/* eslint-disable @typescript-eslint/no-require-imports */
vi.mock('framer-motion', () => {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_, tag: string) {
      return ({ children, ...rest }: Record<string, unknown>) => {
        const Tag = tag as keyof React.JSX.IntrinsicElements
        const safe: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(rest)) {
          if (typeof v !== 'object' && typeof v !== 'function') safe[k] = v
        }
        // @ts-expect-error dynamic tag
        return <Tag {...safe}>{children}</Tag>
      }
    },
  }
  return { motion: new Proxy({}, handler) }
})

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
  MessageCircle: () => <span data-testid="icon-message-circle" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
}))

vi.mock('@/lib/animations', () => ({
  staggerContainer: {},
  slideUp: {},
  staggerItem: {},
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...rest }: Record<string, unknown>) => {
    if (asChild && children) return <>{children}</>
    return <button {...(rest as Record<string, unknown>)}>{children as React.ReactNode}</button>
  },
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Hero', () => {
  async function renderHero() {
    const { Hero } = await import('./Hero')
    return render(<Hero />)
  }

  it('renders "Quality Control" heading', async () => {
    await renderHero()
    expect(screen.getByText('Quality Control')).toBeDefined()
  })

  it('renders "for your relationship" text', async () => {
    await renderHero()
    expect(screen.getByText('for your relationship')).toBeDefined()
  })

  it('renders subtitle', async () => {
    await renderHero()
    expect(screen.getByText('Simple tools to build a stronger relationship together.')).toBeDefined()
  })

  it('renders all 3 feature pill texts', async () => {
    await renderHero()
    expect(screen.getByText('Weekly Check-ins')).toBeDefined()
    expect(screen.getByText('Never Forget What Matters')).toBeDefined()
    expect(screen.getByText('See Your Growth')).toBeDefined()
  })

  it('renders "Start your journey" link pointing to /signup', async () => {
    await renderHero()
    const link = screen.getByText('Start your journey').closest('a')
    expect(link).toBeDefined()
    expect(link?.getAttribute('href')).toBe('/signup')
  })

  it('renders "Learn more" link pointing to #features', async () => {
    await renderHero()
    const link = screen.getByText('Learn more')
    expect(link.closest('a')?.getAttribute('href')).toBe('#features')
  })

  it('renders scroll indicator link to #how-it-works', async () => {
    await renderHero()
    const icon = screen.getByTestId('icon-chevron-down')
    const link = icon.closest('a')
    expect(link).toBeDefined()
    expect(link?.getAttribute('href')).toBe('#how-it-works')
  })
})
