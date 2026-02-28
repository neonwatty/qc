import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return { ...actual, useActionState: vi.fn(() => [{}, vi.fn(), false]) }
})
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/hooks/useRealtimeCouple', () => ({ useRealtimeCouple: vi.fn() }))
vi.mock('@/components/reminders/ReminderCard', () => ({
  ReminderCard: (props: Record<string, unknown>) => (
    <div data-testid={`reminder-${(props.reminder as { id: string }).id}`} />
  ),
}))
vi.mock('@/components/reminders/ReminderForm', () => ({
  ReminderForm: () => <div data-testid="reminder-form" />,
}))
vi.mock('@/components/layout/PageContainer', () => ({
  PageContainer: ({ children, title, action }: Record<string, unknown>) => (
    <div>
      <h1>{title as string}</h1>
      {action as React.ReactNode}
      {children as React.ReactNode}
    </div>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))
vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...(props as React.ComponentProps<'input'>)} />,
}))
vi.mock('lucide-react', () => ({
  Search: () => <span />,
  X: () => <span />,
}))
vi.mock('./actions', () => ({
  createReminder: vi.fn(),
  deleteReminder: vi.fn(),
  snoozeReminder: vi.fn(),
  toggleReminder: vi.fn(),
  unsnoozeReminder: vi.fn(),
}))

import { render, screen, fireEvent } from '@testing-library/react'
import type { DbReminder } from '@/types/database'

const { RemindersContent } = await import('./reminders-content')

function makeReminder(overrides: Partial<DbReminder> = {}): DbReminder {
  return {
    id: 'rem1',
    couple_id: 'c1',
    created_by: 'u1',
    title: 'Test reminder',
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
  initialReminders: [] as DbReminder[],
  userId: 'u1',
  coupleId: 'c1',
  partnerId: 'p1',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RemindersContent', () => {
  it('renders "Reminders" title', () => {
    render(<RemindersContent {...defaultProps} />)
    expect(screen.getByText('Reminders')).toBeDefined()
  })

  it('renders "New Reminder" button', () => {
    render(<RemindersContent {...defaultProps} />)
    expect(screen.getByText('New Reminder')).toBeDefined()
  })

  it('shows empty state when no reminders', () => {
    render(<RemindersContent {...defaultProps} />)
    expect(screen.getByText('No reminders yet. Create one to get started!')).toBeDefined()
  })

  it('renders reminder cards for provided reminders', () => {
    const reminders = [makeReminder({ id: 'r1' }), makeReminder({ id: 'r2' })]
    render(<RemindersContent {...defaultProps} initialReminders={reminders} />)
    expect(screen.getByTestId('reminder-r1')).toBeDefined()
    expect(screen.getByTestId('reminder-r2')).toBeDefined()
  })

  it('renders all 5 filter tabs', () => {
    render(<RemindersContent {...defaultProps} />)
    expect(screen.getByText('all')).toBeDefined()
    expect(screen.getByText('active')).toBeDefined()
    expect(screen.getByText('snoozed')).toBeDefined()
    expect(screen.getByText('overdue')).toBeDefined()
    expect(screen.getByText('inactive')).toBeDefined()
  })

  it('renders search input placeholder', () => {
    render(<RemindersContent {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search reminders...')).toBeDefined()
  })

  it('shows form when New Reminder clicked', () => {
    render(<RemindersContent {...defaultProps} />)
    fireEvent.click(screen.getByText('New Reminder'))
    expect(screen.getByTestId('reminder-form')).toBeDefined()
  })

  it('filter tabs have correct styling for active tab', () => {
    render(<RemindersContent {...defaultProps} />)
    const allTab = screen.getByText('all')
    expect(allTab.className).toContain('bg-primary')
    const activeTab = screen.getByText('active')
    expect(activeTab.className).toContain('bg-muted')
  })
})
