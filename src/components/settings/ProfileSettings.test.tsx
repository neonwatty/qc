import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockFormAction = vi.fn()

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useActionState: vi.fn(() => [{}, mockFormAction, false]),
  }
})

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/app/(app)/settings/actions', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <label {...props}>{children}</label>
  ),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { success: vi.fn() },
}))

const { ProfileSettings } = await import('./ProfileSettings')

const defaultProfile = {
  id: 'u1',
  couple_id: 'c1',
  display_name: 'Alice',
  avatar_url: null,
  email: 'alice@example.com',
  plan: 'free',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  email_bounced_at: null,
  email_complained_at: null,
  email_unsubscribe_token: null,
  email_opted_out_at: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileSettings', () => {
  it('renders "Profile" heading', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Profile')).toBeDefined()
  })

  it('renders "Manage your personal information" subtext', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Manage your personal information')).toBeDefined()
  })

  it('renders disabled email input with userEmail value', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    const emailInput = screen.getByDisplayValue('alice@example.com')
    expect(emailInput).toBeDefined()
    expect(emailInput.getAttribute('disabled')).not.toBeNull()
  })

  it('renders "Email cannot be changed here" note', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Email cannot be changed here')).toBeDefined()
  })

  it('renders "Display Name" label', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Display Name')).toBeDefined()
  })

  it('renders "Avatar URL (optional)" label', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Avatar URL (optional)')).toBeDefined()
  })

  it('renders "Save Profile" button', () => {
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Save Profile')).toBeDefined()
  })

  it('renders "Saving..." when isPending is true', async () => {
    const { useActionState } = await import('react')
    vi.mocked(useActionState).mockReturnValue([{}, mockFormAction, true])
    render(<ProfileSettings profile={defaultProfile} userEmail="alice@example.com" />)
    expect(screen.getByText('Saving...')).toBeDefined()
  })
})
