import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { DbReminder } from '@/types/database'

vi.mock('@/app/(app)/settings/actions/reminders', () => ({
  toggleReminderActive: vi.fn().mockResolvedValue({ error: null }),
}))
vi.mock('@/app/(app)/reminders/actions', () => ({
  deleteReminder: vi.fn().mockResolvedValue({}),
}))

const { ReminderScheduler } = await import('./ReminderScheduler')

function makeReminder(overrides: Partial<DbReminder> = {}): DbReminder {
  return {
    id: 'r1',
    couple_id: 'c1',
    created_by: 'u1',
    title: 'Weekly Check-in',
    message: null,
    category: 'check-in',
    frequency: 'weekly',
    scheduled_for: '2026-03-01T20:00:00Z',
    is_active: true,
    notification_channel: 'both',
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReminderScheduler', () => {
  it('renders heading', () => {
    render(<ReminderScheduler reminders={[]} coupleId="c1" />)
    expect(screen.getByText('Reminder Schedule')).toBeDefined()
  })

  it('shows empty state when no reminders', () => {
    render(<ReminderScheduler reminders={[]} coupleId="c1" />)
    expect(screen.getByText(/No reminders yet/)).toBeDefined()
  })

  it('renders reminder title and frequency', () => {
    render(<ReminderScheduler reminders={[makeReminder()]} coupleId="c1" />)
    expect(screen.getByText('Weekly Check-in')).toBeDefined()
    expect(screen.getByText('Weekly')).toBeDefined()
  })

  it('renders multiple reminders', () => {
    const reminders = [makeReminder(), makeReminder({ id: 'r2', title: 'Daily Gratitude', frequency: 'daily' })]
    render(<ReminderScheduler reminders={reminders} coupleId="c1" />)
    expect(screen.getByText('Weekly Check-in')).toBeDefined()
    expect(screen.getByText('Daily Gratitude')).toBeDefined()
  })

  it('shows enable/disable toggle button', () => {
    render(<ReminderScheduler reminders={[makeReminder()]} coupleId="c1" />)
    expect(screen.getByLabelText('Disable reminder')).toBeDefined()
  })

  it('shows enable label for inactive reminder', () => {
    render(<ReminderScheduler reminders={[makeReminder({ is_active: false })]} coupleId="c1" />)
    expect(screen.getByLabelText('Enable reminder')).toBeDefined()
  })

  it('shows delete button', () => {
    render(<ReminderScheduler reminders={[makeReminder()]} coupleId="c1" />)
    expect(screen.getByLabelText('Delete Weekly Check-in')).toBeDefined()
  })

  it('shows confirmation when delete clicked', () => {
    render(<ReminderScheduler reminders={[makeReminder()]} coupleId="c1" />)
    fireEvent.click(screen.getByLabelText('Delete Weekly Check-in'))
    expect(screen.getByText('Yes')).toBeDefined()
    expect(screen.getByText('No')).toBeDefined()
  })

  it('cancels delete confirmation', () => {
    render(<ReminderScheduler reminders={[makeReminder()]} coupleId="c1" />)
    fireEvent.click(screen.getByLabelText('Delete Weekly Check-in'))
    fireEvent.click(screen.getByText('No'))
    expect(screen.queryByText('Yes')).toBeNull()
  })
})
