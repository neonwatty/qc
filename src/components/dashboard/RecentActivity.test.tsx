import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="icon-checkin" />,
  StickyNote: () => <span data-testid="icon-note" />,
  Trophy: () => <span data-testid="icon-trophy" />,
  ListChecks: () => <span data-testid="icon-action" />,
  HandHeart: () => <span data-testid="icon-request" />,
  Clock: () => <span data-testid="icon-clock" />,
}))

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

describe('RecentActivity - filters', () => {
  it('renders filter pills when activities exist', () => {
    const activities = [makeActivity()]
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('All')).toBeDefined()
    expect(screen.getByText('Check-ins')).toBeDefined()
    expect(screen.getByText('Notes')).toBeDefined()
    expect(screen.getByText('Milestones')).toBeDefined()
    expect(screen.getByText('Actions')).toBeDefined()
    expect(screen.getByText('Requests')).toBeDefined()
  })

  it('does not render filter pills when activities is empty', () => {
    render(<RecentActivity activities={[]} />)
    expect(screen.queryByText('Check-ins')).toBeNull()
  })

  it('filters to show only matching type', () => {
    const activities = [
      makeActivity({ title: 'A check-in', type: 'check-in' }),
      makeActivity({ title: 'A note', type: 'note' }),
      makeActivity({ title: 'A milestone', type: 'milestone' }),
    ]
    render(<RecentActivity activities={activities} />)

    fireEvent.click(screen.getByText('Notes'))
    expect(screen.getByText('A note')).toBeDefined()
    expect(screen.queryByText('A check-in')).toBeNull()
    expect(screen.queryByText('A milestone')).toBeNull()
  })

  it('shows all when "All" filter is clicked', () => {
    const activities = [
      makeActivity({ title: 'A check-in', type: 'check-in' }),
      makeActivity({ title: 'A note', type: 'note' }),
    ]
    render(<RecentActivity activities={activities} />)

    fireEvent.click(screen.getByText('Notes'))
    expect(screen.queryByText('A check-in')).toBeNull()

    fireEvent.click(screen.getByText('All'))
    expect(screen.getByText('A check-in')).toBeDefined()
    expect(screen.getByText('A note')).toBeDefined()
  })

  it('shows empty state when filter matches no items', () => {
    const activities = [makeActivity({ title: 'A check-in', type: 'check-in' })]
    render(<RecentActivity activities={activities} />)

    fireEvent.click(screen.getByText('Notes'))
    expect(screen.getByText('No activity yet')).toBeDefined()
  })
})

describe('RecentActivity - load more', () => {
  function makeManyActivities(count: number): ActivityItem[] {
    return Array.from({ length: count }, (_, i) =>
      makeActivity({ title: `Activity ${i + 1}`, timestamp: new Date(Date.now() - i * 60000).toISOString() }),
    )
  }

  it('shows only 5 items initially', () => {
    const activities = makeManyActivities(10)
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Activity 1')).toBeDefined()
    expect(screen.getByText('Activity 5')).toBeDefined()
    expect(screen.queryByText('Activity 6')).toBeNull()
  })

  it('shows "Show more" button when > 5 items', () => {
    const activities = makeManyActivities(10)
    render(<RecentActivity activities={activities} />)
    expect(screen.getByText('Show more')).toBeDefined()
  })

  it('does not show "Show more" when <= 5 items', () => {
    const activities = makeManyActivities(3)
    render(<RecentActivity activities={activities} />)
    expect(screen.queryByText('Show more')).toBeNull()
  })

  it('shows more items when "Show more" is clicked', () => {
    const activities = makeManyActivities(8)
    render(<RecentActivity activities={activities} />)

    expect(screen.queryByText('Activity 6')).toBeNull()
    fireEvent.click(screen.getByText('Show more'))
    expect(screen.getByText('Activity 6')).toBeDefined()
    expect(screen.getByText('Activity 8')).toBeDefined()
  })

  it('resets display count when filter changes', () => {
    const activities = [
      ...Array.from({ length: 8 }, (_, i) =>
        makeActivity({
          title: `Check ${i + 1}`,
          type: 'check-in',
          timestamp: new Date(Date.now() - i * 60000).toISOString(),
        }),
      ),
      makeActivity({ title: 'A note', type: 'note' }),
    ]
    render(<RecentActivity activities={activities} />)

    // Show more to reveal all
    fireEvent.click(screen.getByText('Show more'))
    expect(screen.getByText('Check 8')).toBeDefined()

    // Switch to Notes filter — should reset to 5
    fireEvent.click(screen.getByText('Notes'))
    expect(screen.getByText('A note')).toBeDefined()

    // Switch back to All — should be back to 5
    fireEvent.click(screen.getByText('All'))
    expect(screen.getByText('Check 1')).toBeDefined()
    expect(screen.queryByText('Check 8')).toBeNull()
  })
})
