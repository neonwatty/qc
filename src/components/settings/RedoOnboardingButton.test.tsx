import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/app/(app)/settings/actions/onboarding', () => ({
  redoOnboarding: vi.fn().mockResolvedValue({ error: null }),
}))

const { RedoOnboardingButton } = await import('./RedoOnboardingButton')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RedoOnboardingButton', () => {
  it('renders restart button', () => {
    render(<RedoOnboardingButton />)
    expect(screen.getByText('Restart Onboarding')).toBeDefined()
  })

  it('shows description text', () => {
    render(<RedoOnboardingButton />)
    expect(screen.getByText(/Restart the onboarding process/)).toBeDefined()
  })

  it('shows confirmation when clicked', () => {
    render(<RedoOnboardingButton />)
    fireEvent.click(screen.getByText('Restart Onboarding'))
    expect(screen.getByText('Yes, Reset Everything')).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('hides confirmation on cancel', () => {
    render(<RedoOnboardingButton />)
    fireEvent.click(screen.getByText('Restart Onboarding'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Yes, Reset Everything')).toBeNull()
  })

  it('shows warning text in confirmation', () => {
    render(<RedoOnboardingButton />)
    fireEvent.click(screen.getByText('Restart Onboarding'))
    expect(screen.getByText(/permanently delete all shared data/)).toBeDefined()
  })

  it('calls redoOnboarding when confirmed', async () => {
    render(<RedoOnboardingButton />)
    fireEvent.click(screen.getByText('Restart Onboarding'))
    fireEvent.click(screen.getByText('Yes, Reset Everything'))
    const { redoOnboarding } = await import('@/app/(app)/settings/actions/onboarding')
    expect(redoOnboarding).toHaveBeenCalledOnce()
  })
})
