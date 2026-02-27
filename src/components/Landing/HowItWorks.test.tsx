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

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
  MessageCircle: () => <span data-testid="icon-message-circle" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
}))

vi.mock('@/lib/animations', () => ({
  staggerContainer: {},
  staggerItem: {},
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HowItWorks', () => {
  async function renderHowItWorks() {
    const { HowItWorks } = await import('./HowItWorks')
    return render(<HowItWorks />)
  }

  it('renders section with id="how-it-works"', async () => {
    const { container } = await renderHowItWorks()
    const section = container.querySelector('section#how-it-works')
    expect(section).toBeDefined()
    expect(section).not.toBeNull()
  })

  it('renders heading "How it works"', async () => {
    await renderHowItWorks()
    expect(screen.getByText('How it works')).toBeDefined()
  })

  it('renders subheading "Get started in three simple steps."', async () => {
    await renderHowItWorks()
    expect(screen.getByText('Get started in three simple steps.')).toBeDefined()
  })

  it('renders all 3 step titles', async () => {
    await renderHowItWorks()
    expect(screen.getByText('Sign up & invite your partner')).toBeDefined()
    expect(screen.getByText('Check in together')).toBeDefined()
    expect(screen.getByText('Track your growth')).toBeDefined()
  })

  it('renders step numbers 1, 2, 3', async () => {
    await renderHowItWorks()
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('renders all 3 step descriptions', async () => {
    await renderHowItWorks()
    expect(screen.getByText('Create your couple profile and send an invite link in seconds.')).toBeDefined()
    expect(screen.getByText('Guided sessions with timers, turn-taking, and structured topics.')).toBeDefined()
    expect(screen.getByText('See patterns, celebrate milestones, and keep building together.')).toBeDefined()
  })

  it('renders 3 step items total', async () => {
    await renderHowItWorks()
    const icons = [
      screen.getByTestId('icon-heart'),
      screen.getByTestId('icon-message-circle'),
      screen.getByTestId('icon-trending-up'),
    ]
    expect(icons).toHaveLength(3)
  })
})
