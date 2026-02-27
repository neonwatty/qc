import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => {
  function MotionDiv({ children, ...props }: Record<string, unknown>) {
    const { initial, animate, exit, transition, whileTap, ...htmlProps } = props
    void initial
    void animate
    void exit
    void transition
    void whileTap
    return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
  }

  return {
    motion: {
      div: MotionDiv,
    },
  }
})

vi.mock('@/app/(app)/reminders/actions', () => ({
  // Type-only import, but mock the module to satisfy the import
}))

import { ReminderForm } from './ReminderForm'
import type { ReminderActionState } from '@/app/(app)/reminders/actions'

const defaultProps = {
  formAction: vi.fn(),
  formState: {} as ReminderActionState,
  isPending: false,
  coupleId: 'couple-123',
  userId: 'user-1',
  partnerId: 'partner-1',
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderForm(overrides: Partial<typeof defaultProps> = {}) {
  return render(<ReminderForm {...defaultProps} {...overrides} />)
}

describe('ReminderForm', () => {
  it('shows "Join a couple first" message when coupleId is null', () => {
    renderForm({ coupleId: null })
    expect(screen.getByText('Join a couple first to create reminders.')).toBeDefined()
  })

  it('renders "New Reminder" heading when coupleId is provided', () => {
    renderForm()
    expect(screen.getByText('New Reminder')).toBeDefined()
  })

  it('renders all form fields', () => {
    renderForm()
    expect(screen.getByLabelText('Title')).toBeDefined()
    expect(screen.getByLabelText('Message (optional)')).toBeDefined()
    expect(screen.getByLabelText('Category')).toBeDefined()
    expect(screen.getByLabelText('Frequency')).toBeDefined()
    expect(screen.getByLabelText('Scheduled For')).toBeDefined()
    expect(screen.getByLabelText('Notification')).toBeDefined()
  })

  it('shows "Assign to" select when both userId and partnerId provided', () => {
    renderForm({ userId: 'user-1', partnerId: 'partner-1' })
    expect(screen.getByLabelText('Assign to')).toBeDefined()
  })

  it('hides "Assign to" select when userId is missing', () => {
    renderForm({ userId: undefined, partnerId: 'partner-1' })
    expect(screen.queryByLabelText('Assign to')).toBeNull()
  })

  it('hides "Assign to" select when partnerId is missing', () => {
    renderForm({ userId: 'user-1', partnerId: undefined })
    expect(screen.queryByLabelText('Assign to')).toBeNull()
  })

  it('shows error message from formState', () => {
    renderForm({ formState: { error: 'Something went wrong' } })
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })

  it('shows "Creating..." and disables button when isPending', () => {
    renderForm({ isPending: true })
    const button = screen.getByRole('button', { name: 'Creating...' })
    expect(button).toBeDefined()
    expect(button).toBeDisabled()
  })

  it('shows "Create Reminder" button when not pending', () => {
    renderForm({ isPending: false })
    const button = screen.getByRole('button', { name: 'Create Reminder' })
    expect(button).toBeDefined()
    expect(button).not.toBeDisabled()
  })
})
