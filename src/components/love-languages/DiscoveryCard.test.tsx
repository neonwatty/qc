import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

const mockConvertToLanguage = vi.fn()
vi.mock('@/contexts/LoveLanguagesContext', () => ({
  useLoveLanguages: vi.fn(() => ({ convertToLanguage: mockConvertToLanguage })),
}))

vi.mock('./ConvertDiscoveryDialog', () => ({
  ConvertDiscoveryDialog: (props: Record<string, unknown>) => (
    <div data-testid="convert-dialog" data-open={String(props.open)} />
  ),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { render, screen, fireEvent } from '@testing-library/react'
import type { LoveLanguageDiscovery } from '@/types'

const { DiscoveryCard } = await import('./DiscoveryCard')

function makeDiscovery(overrides: Partial<LoveLanguageDiscovery> = {}): LoveLanguageDiscovery {
  return {
    id: 'd1',
    coupleId: 'c1',
    userId: 'u1',
    checkInId: null,
    discovery: 'My partner really values quality time',
    convertedToLanguageId: null,
    createdAt: '2025-06-15T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DiscoveryCard', () => {
  it('renders discovery heading', () => {
    render(<DiscoveryCard discovery={makeDiscovery()} onDelete={vi.fn()} />)
    expect(screen.getByText('💡 Discovery')).toBeDefined()
  })

  it('renders discovery text', () => {
    render(<DiscoveryCard discovery={makeDiscovery()} onDelete={vi.fn()} />)
    expect(screen.getByText('My partner really values quality time')).toBeDefined()
  })

  it('shows Convert to Language and Delete buttons when not converted', () => {
    render(<DiscoveryCard discovery={makeDiscovery()} onDelete={vi.fn()} />)
    expect(screen.getByText('Convert to Language')).toBeDefined()
    expect(screen.getByText('Delete')).toBeDefined()
  })

  it('hides buttons when convertedToLanguageId is set', () => {
    render(<DiscoveryCard discovery={makeDiscovery({ convertedToLanguageId: 'lang1' })} onDelete={vi.fn()} />)
    expect(screen.queryByText('Convert to Language')).toBeNull()
    expect(screen.queryByText('Delete')).toBeNull()
  })

  it('shows converted badge when convertedToLanguageId is set', () => {
    render(<DiscoveryCard discovery={makeDiscovery({ convertedToLanguageId: 'lang1' })} onDelete={vi.fn()} />)
    expect(screen.getByText('🔗 Converted to Language')).toBeDefined()
  })

  it('calls onDelete with discovery id when Delete clicked', () => {
    const onDelete = vi.fn()
    render(<DiscoveryCard discovery={makeDiscovery()} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('d1')
  })

  it('opens ConvertDiscoveryDialog when Convert to Language clicked', () => {
    render(<DiscoveryCard discovery={makeDiscovery()} onDelete={vi.fn()} />)
    expect(screen.getByTestId('convert-dialog').getAttribute('data-open')).toBe('false')
    fireEvent.click(screen.getByText('Convert to Language'))
    expect(screen.getByTestId('convert-dialog').getAttribute('data-open')).toBe('true')
  })
})
