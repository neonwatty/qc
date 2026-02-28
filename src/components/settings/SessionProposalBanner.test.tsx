import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

const mockRespondToProposal = vi.fn()

vi.mock('@/contexts/SessionSettingsContext', () => ({
  useSessionSettings: vi.fn(() => ({
    pendingProposal: null,
    respondToProposal: mockRespondToProposal,
  })),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children as React.ReactNode}</button>
  ),
}))

vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  Clock: () => <span data-testid="icon-clock" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SessionProposalBanner', () => {
  async function loadComponent() {
    const mod = await import('./SessionProposalBanner')
    return mod.SessionProposalBanner
  }

  async function renderWithProposal(settings: Record<string, unknown>) {
    const { useSessionSettings } = await import('@/contexts/SessionSettingsContext')
    const mockUseSessionSettings = vi.mocked(useSessionSettings)
    mockUseSessionSettings.mockReturnValue({
      pendingProposal: { id: 'p1', settings },
      respondToProposal: mockRespondToProposal,
    } as unknown as ReturnType<typeof useSessionSettings>)

    const SessionProposalBanner = await loadComponent()
    return render(<SessionProposalBanner />)
  }

  it('renders nothing when no pending proposal', async () => {
    const SessionProposalBanner = await loadComponent()
    const { container } = render(<SessionProposalBanner />)
    expect(container.innerHTML).toBe('')
  })

  it('renders heading when proposal exists', async () => {
    await renderWithProposal({ sessionDuration: 30 })
    expect(screen.getByText('Session Settings Proposal')).toBeDefined()
  })

  it('shows partner message text', async () => {
    await renderWithProposal({ sessionDuration: 30 })
    expect(screen.getByText('Your partner has proposed changes to your check-in session settings.')).toBeDefined()
  })

  it('displays proposed changes with labels', async () => {
    await renderWithProposal({ sessionDuration: 30 })
    expect(screen.getByText('Session Duration:')).toBeDefined()
    expect(screen.getByText('30 min')).toBeDefined()
  })

  it('formats boolean values as Yes/No', async () => {
    await renderWithProposal({ turnBasedMode: true, allowExtensions: false })
    expect(screen.getByText('Yes')).toBeDefined()
    expect(screen.getByText('No')).toBeDefined()
  })

  it('calls respondToProposal with true when Accept clicked', async () => {
    await renderWithProposal({ sessionDuration: 30 })
    fireEvent.click(screen.getByText('Accept'))
    expect(mockRespondToProposal).toHaveBeenCalledWith('p1', true)
  })

  it('calls respondToProposal with false when Decline clicked', async () => {
    await renderWithProposal({ sessionDuration: 30 })
    fireEvent.click(screen.getByText('Decline'))
    expect(mockRespondToProposal).toHaveBeenCalledWith('p1', false)
  })
})
