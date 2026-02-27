import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { PrivacyBadge } = await import('./PrivacyBadge')

describe('PrivacyBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Shared" for privacy="shared"', () => {
    render(<PrivacyBadge privacy="shared" />)
    expect(screen.getByText('Shared')).toBeDefined()
  })

  it('shows "Private" for privacy="private"', () => {
    render(<PrivacyBadge privacy="private" />)
    expect(screen.getByText('Private')).toBeDefined()
  })

  it('shows "Draft" for privacy="draft"', () => {
    render(<PrivacyBadge privacy="draft" />)
    expect(screen.getByText('Draft')).toBeDefined()
  })

  it('in compact mode, shows "S" for shared', () => {
    render(<PrivacyBadge privacy="shared" compact />)
    expect(screen.getByText('S')).toBeDefined()
  })

  it('in compact mode, shows "P" for private', () => {
    render(<PrivacyBadge privacy="private" compact />)
    expect(screen.getByText('P')).toBeDefined()
  })

  it('passes className to span', () => {
    const { container } = render(<PrivacyBadge privacy="shared" className="custom-class" />)
    const span = container.querySelector('span')
    expect(span?.className).toContain('custom-class')
  })
})
