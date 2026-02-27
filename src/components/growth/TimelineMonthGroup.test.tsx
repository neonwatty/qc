import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import type { Milestone } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => {
      const { initial, animate, exit, transition, ...htmlProps } = props as Record<string, unknown>
      void initial
      void animate
      void exit
      void transition
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="icon-calendar" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
}))

vi.mock('@/components/ui/motion', () => ({
  StaggerContainer: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
  StaggerItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('./MilestoneCard', () => ({
  MilestoneCard: (props: Record<string, unknown>) => {
    const m = props.milestone as Milestone
    return <div data-testid={`milestone-${m.id}`}>{m.title}</div>
  },
}))

const { MonthGroupSection } = await import('./TimelineMonthGroup')

const makeMilestone = (id: string, title: string): Milestone => ({
  id,
  coupleId: 'c1',
  title,
  description: 'desc',
  category: 'growth',
  achievedAt: '2025-01-15',
  icon: null,
  rarity: 'common',
  points: 10,
  photoUrl: null,
})

const twoEntries = [makeMilestone('m1', 'First Steps'), makeMilestone('m2', 'Big Win')]

const defaultGroup = { key: '2025-01', displayKey: 'January 2025', entries: twoEntries }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MonthGroupSection', () => {
  it('shows displayKey as month heading', () => {
    render(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded onToggle={vi.fn()} />)
    expect(screen.getByText('January 2025')).toBeDefined()
  })

  it('shows plural milestone count', () => {
    render(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded onToggle={vi.fn()} />)
    expect(screen.getByText('(2 milestones)')).toBeDefined()
  })

  it('shows singular milestone count', () => {
    const singleGroup = { key: '2025-02', displayKey: 'February 2025', entries: [makeMilestone('m3', 'Solo')] }
    render(<MonthGroupSection group={singleGroup} groupIndex={0} isExpanded onToggle={vi.fn()} />)
    expect(screen.getByText('(1 milestone)')).toBeDefined()
  })

  it('shows ChevronUp when expanded', () => {
    render(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded onToggle={vi.fn()} />)
    expect(screen.getByTestId('icon-chevron-up')).toBeDefined()
    expect(screen.queryByTestId('icon-chevron-down')).toBeNull()
  })

  it('shows ChevronDown when collapsed', () => {
    render(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded={false} onToggle={vi.fn()} />)
    expect(screen.getByTestId('icon-chevron-down')).toBeDefined()
    expect(screen.queryByTestId('icon-chevron-up')).toBeNull()
  })

  it('calls onToggle when header button clicked', () => {
    const onToggle = vi.fn()
    render(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('renders MilestoneCards when expanded, none when collapsed', () => {
    const { rerender } = render(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded onToggle={vi.fn()} />)
    expect(screen.getByTestId('milestone-m1')).toBeDefined()
    expect(screen.getByTestId('milestone-m2')).toBeDefined()

    rerender(<MonthGroupSection group={defaultGroup} groupIndex={0} isExpanded={false} onToggle={vi.fn()} />)
    expect(screen.queryByTestId('milestone-m1')).toBeNull()
    expect(screen.queryByTestId('milestone-m2')).toBeNull()
  })
})
