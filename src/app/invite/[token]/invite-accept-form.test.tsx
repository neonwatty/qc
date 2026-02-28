vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return { ...actual, useActionState: vi.fn(() => [{ error: null }, vi.fn(), false]) }
})

vi.mock('./actions', () => ({
  acceptInviteAction: vi.fn(),
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useActionState } from 'react'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useActionState).mockReturnValue([{ error: null }, vi.fn(), false])
})

describe('InviteAcceptForm', () => {
  async function renderForm(token = 'abc-123') {
    const { InviteAcceptForm } = await import('./invite-accept-form')
    return render(<InviteAcceptForm token={token} />)
  }

  it('renders "Join as a Couple" button', async () => {
    await renderForm()
    expect(screen.getByRole('button', { name: 'Join as a Couple' })).toBeDefined()
  })

  it('renders hidden input with token value', async () => {
    const { container } = await renderForm('my-token')
    const input = container.querySelector('input[type="hidden"][name="token"]') as HTMLInputElement
    expect(input).toBeDefined()
    expect(input.value).toBe('my-token')
  })

  it('shows "Joining..." when isPending is true', async () => {
    vi.mocked(useActionState).mockReturnValue([{ error: null }, vi.fn(), true])
    await renderForm()
    expect(screen.getByRole('button', { name: 'Joining...' })).toBeDefined()
  })

  it('shows error message when state has error', async () => {
    vi.mocked(useActionState).mockReturnValue([{ error: 'Invite expired' }, vi.fn(), false])
    await renderForm()
    expect(screen.getByText('Invite expired')).toBeDefined()
  })

  it('button is disabled when isPending', async () => {
    vi.mocked(useActionState).mockReturnValue([{ error: null }, vi.fn(), true])
    await renderForm()
    const button = screen.getByRole('button', { name: 'Joining...' })
    expect(button.hasAttribute('disabled')).toBe(true)
  })
})
