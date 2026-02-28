import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  Filter: () => <span data-testid="icon-filter" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  Award: () => <span data-testid="icon-award" />,
  Target: () => <span data-testid="icon-target" />,
  Heart: () => <span data-testid="icon-heart" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('./TimelineMonthGroup', () => ({
  MonthGroupSection: (props: Record<string, unknown>) => (
    <div data-testid="month-group" data-key={String((props.group as Record<string, unknown>)?.key)} />
  ),
}))

vi.mock('date-fns', () => ({
  format: vi.fn(() => '2025-01'),
  parseISO: vi.fn(() => new Date('2025-01-15')),
  compareDesc: vi.fn(() => -1),
}))

const { Timeline } = await import('./Timeline')

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'm1',
    coupleId: 'c1',
    title: 'Test',
    description: 'Desc',
    category: 'communication',
    icon: null,
    achievedAt: '2025-01-15',
    rarity: 'common',
    points: 10,
    photoUrl: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Timeline', () => {
  it('renders All filter button', () => {
    render(<Timeline milestones={[]} />)
    expect(screen.getByText('All')).toBeDefined()
  })

  it('renders sort buttons Newest Oldest Category', () => {
    render(<Timeline milestones={[]} />)
    expect(screen.getByText('Newest')).toBeDefined()
    expect(screen.getByText('Oldest')).toBeDefined()
    expect(screen.getByText('Category')).toBeDefined()
  })

  it('renders No milestones yet empty state when milestones is empty', () => {
    render(<Timeline milestones={[]} />)
    expect(screen.getByText('No milestones yet')).toBeDefined()
  })

  it('renders empty state message for filtered category when no matches', () => {
    render(<Timeline milestones={[]} />)
    expect(screen.getByText('Create your first milestone to start tracking your relationship journey.')).toBeDefined()
  })

  it('hides filter bar when showFilters is false', () => {
    render(<Timeline milestones={[]} showFilters={false} />)
    expect(screen.queryByText('All')).toBeNull()
    expect(screen.queryByText('Newest')).toBeNull()
  })

  it('renders MonthGroupSection when milestones provided', () => {
    render(<Timeline milestones={[makeMilestone()]} />)
    expect(screen.getByTestId('month-group')).toBeDefined()
  })

  it('shows Load More button when milestones length exceeds maxVisible', () => {
    const many = Array.from({ length: 3 }, (_, i) => makeMilestone({ id: `m${i}` }))
    render(<Timeline milestones={many} maxVisible={2} />)
    expect(screen.getByText('Load More')).toBeDefined()
  })

  it('does not show Load More when milestones length is within maxVisible', () => {
    const few = [makeMilestone()]
    render(<Timeline milestones={few} maxVisible={20} />)
    expect(screen.queryByText('Load More')).toBeNull()
  })
})
