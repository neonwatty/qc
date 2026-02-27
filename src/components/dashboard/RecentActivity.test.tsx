import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="icon-checkin" />,
  StickyNote: () => <span data-testid="icon-note" />,
  Trophy: () => <span data-testid="icon-trophy" />,
  ListChecks: () => <span data-testid="icon-action" />,
  HandHeart: () => <span data-testid="icon-request" />,
  Clock: () => <span data-testid="icon-clock" />,
}))

import { render, screen } from '@testing-library/react'

import type { ActivityItem } from '@/lib/activity'

import { RecentActivity } from './RecentActivity'

function makeActivity(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    type: 'check-in',
    title: 'Check-in completed',
    description: 'Communication, Quality Time',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RecentActivity', () => {
  it('shows Recent Activity heading', () => {
    render(<RecentActivity activities={[]} />)
    expect(screen.getByText('Recent Activity')).toBeDefined()
  })

  it('shows empty state when activities is empty', () => {
    render(<RecentActivity activities={[]} />)
    expect(screen.getByText('No activity yet')).toBeDefined()
  })

  it('renders activity titles', () => {
    const activities = [makeActivity({ title: 'Morning check-in' })]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Morning check-in')).toBeDefined()
  })

  it('shows activity descriptions when provided', () => {
    const activities = [makeActivity({ description: 'Topics: Trust' })]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Topics: Trust')).toBeDefined()
  })

  it('shows relative time for recent activities', () => {
    const activities = [makeActivity({ timestamp: new Date().toISOString() })]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText(/less than a minute ago|seconds? ago/i)).toBeDefined()
  })

  it('shows multiple activities in order', () => {
    const activities = [
      makeActivity({ title: 'First activity', type: 'note' }),
      makeActivity({ title: 'Second activity', type: 'milestone' }),
      makeActivity({ title: 'Third activity', type: 'request' }),
    ]
    render(<RecentActivity activities={activities} />)
    const items = screen.getAllByText(/activity/)
    expect(items).toHaveLength(3)
    expect(items[0].textContent).toBe('First activity')
    expect(items[1].textContent).toBe('Second activity')
    expect(items[2].textContent).toBe('Third activity')
  })

  it('passes className to Card', () => {
    const { container } = render(<RecentActivity activities={[]} className="custom-class" />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('custom-class')
  })
})
