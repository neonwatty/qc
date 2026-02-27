import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/app/(app)/requests/actions', () => ({
  // Type-only import, but mock the module to satisfy the import
}))

import { RequestForm } from './RequestForm'

const defaultProps = {
  formAction: vi.fn(),
  formState: {} as { error?: string; success?: boolean },
  isPending: false,
  partnerId: 'partner-123',
  partnerName: 'Alice',
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderForm(overrides: Partial<typeof defaultProps> = {}) {
  return render(<RequestForm {...defaultProps} {...overrides} />)
}

describe('RequestForm', () => {
  it('renders partner name in heading', () => {
    renderForm()
    expect(screen.getByText('New Request for Alice')).toBeDefined()
  })

  it('renders title, description, and suggested_date inputs', () => {
    renderForm()
    expect(screen.getByLabelText('Title')).toBeDefined()
    expect(screen.getByLabelText('Description (optional)')).toBeDefined()
    expect(screen.getByLabelText('Suggested Date (optional)')).toBeDefined()
  })

  it('has hidden input with partnerId value', () => {
    const { container } = renderForm()
    const hidden = container.querySelector('input[name="requested_for"]') as HTMLInputElement
    expect(hidden).toBeDefined()
    expect(hidden.type).toBe('hidden')
    expect(hidden.value).toBe('partner-123')
  })

  it('shows "Send Request" button when not pending', () => {
    renderForm({ isPending: false })
    const button = screen.getByRole('button', { name: 'Send Request' })
    expect(button).toBeDefined()
    expect(button).not.toBeDisabled()
  })

  it('shows "Sending..." and disables button when isPending is true', () => {
    renderForm({ isPending: true })
    const button = screen.getByRole('button', { name: 'Sending...' })
    expect(button).toBeDefined()
    expect(button).toBeDisabled()
  })

  it('displays error message when formState has error', () => {
    renderForm({ formState: { error: 'Something went wrong' } })
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })
})
