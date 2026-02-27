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
  Shield: () => <span data-testid="icon-shield" />,
  Zap: () => <span data-testid="icon-zap" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
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

describe('SocialProof', () => {
  async function renderSocialProof() {
    const { SocialProof } = await import('./SocialProof')
    return render(<SocialProof />)
  }

  it('renders all 4 trust signal texts', async () => {
    await renderSocialProof()
    expect(screen.getByText('Built for couples')).toBeDefined()
    expect(screen.getByText('Privacy-first design')).toBeDefined()
    expect(screen.getByText('Free to start')).toBeDefined()
    expect(screen.getByText('No data selling, ever')).toBeDefined()
  })

  it('renders 4 trust signal items total', async () => {
    await renderSocialProof()
    const texts = ['Built for couples', 'Privacy-first design', 'Free to start', 'No data selling, ever']
    const items = texts.map((t) => screen.getByText(t))
    expect(items).toHaveLength(4)
  })

  it('renders within a section element', async () => {
    const { container } = await renderSocialProof()
    const section = container.querySelector('section')
    expect(section).toBeDefined()
    expect(section).not.toBeNull()
  })

  it('renders 4 icon elements', async () => {
    await renderSocialProof()
    expect(screen.getByTestId('icon-heart')).toBeDefined()
    expect(screen.getByTestId('icon-shield')).toBeDefined()
    expect(screen.getByTestId('icon-zap')).toBeDefined()
    expect(screen.getByTestId('icon-sparkles')).toBeDefined()
  })

  it('each trust signal text is inside a span', async () => {
    await renderSocialProof()
    const texts = ['Built for couples', 'Privacy-first design', 'Free to start', 'No data selling, ever']
    for (const text of texts) {
      const el = screen.getByText(text)
      expect(el.tagName.toLowerCase()).toBe('span')
    }
  })
})
