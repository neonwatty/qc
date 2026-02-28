import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import type { Milestone } from '@/types'

vi.mock('framer-motion', () => {
  function MotionDiv(props: Record<string, unknown>) {
    const { children, initial, animate, exit, transition, whileHover, whileTap, ...rest } = props
    void initial
    void animate
    void exit
    void transition
    void whileHover
    void whileTap
    return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
  }
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }
})

vi.mock('lucide-react', () => ({
  Award: () => <span data-testid="icon-award" />,
  CheckCircle: () => <span data-testid="icon-check-circle" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Clock: () => <span data-testid="icon-clock" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('./milestone-card-config', () => {
  const DummyIcon = () => <span data-testid="category-icon" />
  const makeConfig = () => ({
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    gradientFrom: 'from-gray-500',
    gradientTo: 'to-gray-600',
    icon: DummyIcon,
  })
  return {
    CATEGORY_CONFIG: {
      communication: makeConfig(),
      intimacy: makeConfig(),
      growth: makeConfig(),
      relationship: makeConfig(),
      adventure: makeConfig(),
      milestone: makeConfig(),
      custom: makeConfig(),
    },
    RARITY_CONFIG: {
      common: { borderColor: 'border-gray-300', badgeColor: 'bg-gray-100 text-gray-700' },
      rare: { borderColor: 'border-blue-300', badgeColor: 'bg-blue-100 text-blue-700' },
      epic: { borderColor: 'border-purple-300', badgeColor: 'bg-purple-100 text-purple-700' },
      legendary: { borderColor: 'border-yellow-300', badgeColor: 'bg-yellow-100 text-yellow-700' },
    },
    formatMilestoneDate: vi.fn(() => 'Jan 15'),
  }
})

const { MilestoneCard } = await import('./MilestoneCard')

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'm1',
    coupleId: 'c1',
    title: 'First Check-in',
    description: 'Completed our first session',
    category: 'communication',
    icon: null,
    achievedAt: null,
    rarity: 'common',
    points: 10,
    photoUrl: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MilestoneCard', () => {
  it('renders milestone title in default variant', () => {
    render(<MilestoneCard milestone={makeMilestone()} />)
    expect(screen.getByText('First Check-in')).toBeDefined()
  })

  it('renders milestone description', () => {
    render(<MilestoneCard milestone={makeMilestone()} />)
    expect(screen.getByText('Completed our first session')).toBeDefined()
  })

  it('renders points text', () => {
    render(<MilestoneCard milestone={makeMilestone({ points: 10 })} />)
    expect(screen.getByText('10 pts')).toBeDefined()
  })

  it('shows achieved date when achievedAt is set', () => {
    render(<MilestoneCard milestone={makeMilestone({ achievedAt: '2025-01-15' })} />)
    expect(screen.getByText('Jan 15')).toBeDefined()
  })

  it('shows Upcoming text when not achieved in compact variant', () => {
    render(<MilestoneCard milestone={makeMilestone({ achievedAt: null })} variant="compact" />)
    expect(screen.getByText('Upcoming')).toBeDefined()
  })

  it('renders photo in featured variant when photoUrl is set', () => {
    render(
      <MilestoneCard milestone={makeMilestone({ photoUrl: 'https://example.com/photo.jpg' })} variant="featured" />,
    )
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('renders rarity badge text for non-common rarity in default variant', () => {
    render(<MilestoneCard milestone={makeMilestone({ rarity: 'rare' })} />)
    expect(screen.getByText('rare')).toBeDefined()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(<MilestoneCard milestone={makeMilestone()} onClick={onClick} />)
    fireEvent.click(screen.getByText('First Check-in'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
