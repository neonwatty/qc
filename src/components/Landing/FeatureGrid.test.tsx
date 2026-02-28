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
  MessageSquare: () => <span data-testid="icon-message-square" />,
  Heart: () => <span data-testid="icon-heart" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  Shield: () => <span data-testid="icon-shield" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Bell: () => <span data-testid="icon-bell" />,
  Settings: () => <span data-testid="icon-settings" />,
  Users: () => <span data-testid="icon-users" />,
  Target: () => <span data-testid="icon-target" />,
}))

vi.mock('@/lib/animations', () => ({
  staggerContainer: {},
  staggerItem: {},
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...rest }: Record<string, unknown>) => (
    <div {...(rest as Record<string, unknown>)}>{children as React.ReactNode}</div>
  ),
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FeatureGrid', () => {
  async function renderGrid() {
    const { FeatureGrid } = await import('./FeatureGrid')
    return render(<FeatureGrid />)
  }

  it('renders section with id="features"', async () => {
    const { container } = await renderGrid()
    const section = container.querySelector('section#features')
    expect(section).toBeDefined()
    expect(section).not.toBeNull()
  })

  it('renders heading containing "For lovers who like" and "systems"', async () => {
    await renderGrid()
    expect(screen.getByText(/For lovers who like/)).toBeDefined()
    expect(screen.getByText('systems')).toBeDefined()
  })

  it('renders subheading', async () => {
    await renderGrid()
    expect(screen.getByText('For couples who like to solve problems together.')).toBeDefined()
  })

  it('renders all 9 feature titles', async () => {
    await renderGrid()
    expect(screen.getByText('Guided Check-ins')).toBeDefined()
    expect(screen.getByText('Session Rules')).toBeDefined()
    expect(screen.getByText('Relationship Reminders')).toBeDefined()
    expect(screen.getByText('Pattern Recognition')).toBeDefined()
    expect(screen.getByText('Progress Metrics')).toBeDefined()
    expect(screen.getByText('Privacy First')).toBeDefined()
    expect(screen.getByText('Unified View')).toBeDefined()
    expect(screen.getByText('Action Items')).toBeDefined()
    expect(screen.getByText('Relationship Goals')).toBeDefined()
  })

  it('renders feature descriptions', async () => {
    await renderGrid()
    expect(
      screen.getByText('Structured conversations that help you identify and address what needs attention.'),
    ).toBeDefined()
    expect(
      screen.getByText('Your conversations stay private. Share only what you choose with flexible privacy controls.'),
    ).toBeDefined()
  })

  it('renders bottom CTA heading', async () => {
    await renderGrid()
    expect(screen.getByText('Ready to engineer a better relationship?')).toBeDefined()
  })

  it('renders "Get started free" link pointing to /signup', async () => {
    await renderGrid()
    const link = screen.getByText('Get started free')
    expect(link.closest('a')?.getAttribute('href')).toBe('/signup')
  })
})
