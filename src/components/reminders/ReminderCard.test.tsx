import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 15, 2:00 PM'),
  parseISO: vi.fn((s: string) => new Date(s)),
}))
vi.mock('lucide-react', () => ({
  AlarmClock: () => <span data-testid="icon-alarm-clock" />,
  Clock: () => <span data-testid="icon-clock" />,
  User: () => <span data-testid="icon-user" />,
}))
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children as React.ReactNode}</button>
  ),
}))
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}))

import { render, screen } from '@testing-library/react'
import type { DbReminder } from '@/types/database'

const { ReminderCard } = await import('./ReminderCard')

function makeReminder(overrides: Partial<DbReminder> = {}): DbReminder {
  return {
    id: 'rem1',
    couple_id: 'c1',
    created_by: 'u1',
    title: 'Morning meditation',
    message: null,
    category: 'habit',
    frequency: 'daily',
    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
    is_active: true,
    notification_channel: 'in-app',
    custom_schedule: null,
    is_snoozed: false,
    snooze_until: null,
    last_notified_at: null,
    assigned_to: null,
    related_check_in_id: null,
    related_action_item_id: null,
    converted_from_request_id: null,
    ...overrides,
  }
}

const defaultProps = {
  reminder: makeReminder(),
  isOwner: false,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onSnooze: vi.fn(),
  onUnsnooze: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReminderCard', () => {
  it('renders reminder title', () => {
    render(<ReminderCard {...defaultProps} />)
    expect(screen.getByText('Morning meditation')).toBeDefined()
  })

  it('shows category badge', () => {
    render(<ReminderCard {...defaultProps} />)
    expect(screen.getByText('habit')).toBeDefined()
  })

  it('shows Overdue badge when isOverdue is true', () => {
    render(<ReminderCard {...defaultProps} isOverdue />)
    expect(screen.getByText('Overdue')).toBeDefined()
  })

  it('shows message when provided', () => {
    render(<ReminderCard {...defaultProps} reminder={makeReminder({ message: 'Stay consistent' })} />)
    expect(screen.getByText('Stay consistent')).toBeDefined()
  })

  it('shows frequency label', () => {
    render(<ReminderCard {...defaultProps} reminder={makeReminder({ frequency: 'daily' })} />)
    expect(screen.getByText('Daily')).toBeDefined()
  })

  it('shows Pause/Resume and Delete buttons when isOwner', () => {
    render(<ReminderCard {...defaultProps} isOwner />)
    expect(screen.getByText('Pause')).toBeDefined()
    expect(screen.getByText('Delete')).toBeDefined()
  })

  it('hides action buttons when not isOwner', () => {
    render(<ReminderCard {...defaultProps} isOwner={false} />)
    expect(screen.queryByText('Pause')).toBeNull()
    expect(screen.queryByText('Resume')).toBeNull()
    expect(screen.queryByText('Delete')).toBeNull()
  })

  it('shows assigneeName when provided', () => {
    render(<ReminderCard {...defaultProps} assigneeName="Alex" />)
    expect(screen.getByText(/Assigned to Alex/)).toBeDefined()
  })
})
