import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import type { DbCouple } from '@/types/database'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/app/(app)/settings/actions', () => ({
  leaveCoupleAction: vi.fn().mockResolvedValue({ error: null }),
  resendInviteAction: vi.fn().mockResolvedValue({ error: null }),
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
  CardHeader: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { success: vi.fn() },
}))

const { RelationshipSettings } = await import('./RelationshipSettings')

beforeEach(() => {
  vi.clearAllMocks()
})

function makeCouple(overrides: Partial<DbCouple> = {}): DbCouple {
  return {
    id: 'c1',
    name: 'Us',
    relationship_start_date: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
    settings: {},
    ...overrides,
  }
}

describe('RelationshipSettings', () => {
  it('shows "You are not currently in a couple" when couple is null', () => {
    render(<RelationshipSettings couple={null} partner={null} pendingInvite={null} />)
    expect(screen.getByText(/You are not currently in a couple/)).toBeDefined()
  })

  it('shows "Relationship" heading when couple exists', () => {
    render(<RelationshipSettings couple={makeCouple()} partner={null} pendingInvite={null} />)
    const headings = screen.getAllByText('Relationship')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('shows "Manage your couple settings" subtext', () => {
    render(<RelationshipSettings couple={makeCouple()} partner={null} pendingInvite={null} />)
    expect(screen.getByText('Manage your couple settings')).toBeDefined()
  })

  it('shows couple name when couple.name is set', () => {
    render(<RelationshipSettings couple={makeCouple({ name: 'Dream Team' })} partner={null} pendingInvite={null} />)
    expect(screen.getByText('Dream Team')).toBeDefined()
  })

  it('shows partner display name when partner exists', () => {
    const partner = { id: 'p1', display_name: 'Alex', email: 'alex@test.com' }
    render(<RelationshipSettings couple={makeCouple()} partner={partner} pendingInvite={null} />)
    expect(screen.getByText('Alex')).toBeDefined()
  })

  it('shows "Invite sent to" text when pendingInvite exists', () => {
    const invite = { id: 'inv-1', invited_email: 'partner@test.com', status: 'pending' }
    render(<RelationshipSettings couple={makeCouple()} partner={null} pendingInvite={invite} />)
    expect(screen.getByText(/Invite sent to/)).toBeDefined()
    expect(screen.getByText('partner@test.com')).toBeDefined()
  })

  it('shows "Resend Invite" button when pendingInvite exists', () => {
    const invite = { id: 'inv-1', invited_email: 'partner@test.com', status: 'pending' }
    render(<RelationshipSettings couple={makeCouple()} partner={null} pendingInvite={invite} />)
    expect(screen.getByText('Resend Invite')).toBeDefined()
  })

  it('shows "Leave Couple" button in danger zone', () => {
    render(<RelationshipSettings couple={makeCouple()} partner={null} pendingInvite={null} />)
    expect(screen.getByText('Leave Couple')).toBeDefined()
  })
})
