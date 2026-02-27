import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('lucide-react', () => ({
  CalendarClock: () => <span data-testid="icon-calendar" />,
  Bell: () => <span data-testid="icon-bell" />,
  ArrowRight: () => <span data-testid="icon-arrow" />,
}))

import { render, screen } from '@testing-library/react'

import { TodayReminders } from './TodayReminders'

interface TodayReminder {
  id: string
  title: string
  scheduledFor: string
  category: string
  isOverdue: boolean
}

function makeReminder(overrides: Partial<TodayReminder> = {}): TodayReminder {
  return {
    id: crypto.randomUUID(),
    title: 'Date night',
    scheduledFor: '2025-06-15T14:30:00.000Z',
    category: 'wellness',
    isOverdue: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TodayReminders', () => {
  it('shows heading', () => {
    render(<TodayReminders reminders={[]} />)
    expect(screen.getByText("Today's Reminders")).toBeDefined()
  })

  it('shows empty state when no reminders', () => {
    render(<TodayReminders reminders={[]} />)
    expect(screen.getByText('No reminders today')).toBeDefined()
  })

  it('hides View All link when no reminders', () => {
    render(<TodayReminders reminders={[]} />)
    expect(screen.queryByText('View All')).toBeNull()
  })

  it('shows View All link when reminders exist', () => {
    render(<TodayReminders reminders={[makeReminder()]} />)
    expect(screen.getByText('View All')).toBeDefined()
  })

  it('renders reminder titles', () => {
    const reminders = [makeReminder({ title: 'Weekly check-in' })]
    render(<TodayReminders reminders={reminders} />)
    expect(screen.getByText('Weekly check-in')).toBeDefined()
  })

  it('shows category badge for reminders', () => {
    const reminders = [makeReminder({ category: 'health' })]
    render(<TodayReminders reminders={reminders} />)
    expect(screen.getByText('health')).toBeDefined()
  })

  it('shows max 3 reminders with overflow text', () => {
    const reminders = [
      makeReminder({ id: '1', title: 'Reminder A' }),
      makeReminder({ id: '2', title: 'Reminder B' }),
      makeReminder({ id: '3', title: 'Reminder C' }),
      makeReminder({ id: '4', title: 'Reminder D' }),
      makeReminder({ id: '5', title: 'Reminder E' }),
    ]
    render(<TodayReminders reminders={reminders} />)
    expect(screen.getByText('Reminder A')).toBeDefined()
    expect(screen.getByText('Reminder B')).toBeDefined()
    expect(screen.getByText('Reminder C')).toBeDefined()
    expect(screen.queryByText('Reminder D')).toBeNull()
    expect(screen.getByText('+2 more reminders')).toBeDefined()
  })

  it('shows Overdue text for overdue reminders', () => {
    const reminders = [makeReminder({ isOverdue: true })]
    render(<TodayReminders reminders={reminders} />)
    expect(screen.getByText(/Overdue/)).toBeDefined()
  })
})
