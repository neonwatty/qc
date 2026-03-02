import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

const mockUsePathname = vi.fn(() => '/dashboard')

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: Record<string, unknown>) => <div>{children as React.ReactNode}</div>,
    button: ({ children, onClick, className }: Record<string, unknown>) => (
      <button onClick={onClick as React.MouseEventHandler} className={className as string}>
        {children as React.ReactNode}
      </button>
    ),
  },
}))
vi.mock('@/lib/utils', () => ({ cn: (...args: unknown[]) => args.filter(Boolean).join(' ') }))
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Heart: () => <span data-testid="icon-heart" />,
  MessageCircle: () => <span data-testid="icon-message" />,
  Camera: () => <span data-testid="icon-camera" />,
  Calendar: () => <span data-testid="icon-calendar" />,
}))
vi.mock('@/components/ui/TouchButton', () => ({
  FAB: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button data-testid="fab" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}))

const { PrimaryActionFAB, MobileActionBar } = await import('./PrimaryActionFAB')

beforeEach(() => {
  vi.clearAllMocks()
  mockUsePathname.mockReturnValue('/dashboard')
})

describe('PrimaryActionFAB', () => {
  it('renders FAB on /dashboard route', () => {
    render(<PrimaryActionFAB />)
    expect(screen.getByTestId('fab')).toBeDefined()
  })

  it('returns null when disabled is true', () => {
    const { container } = render(<PrimaryActionFAB disabled />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null on unmatched route', () => {
    mockUsePathname.mockReturnValue('/unknown')
    const { container } = render(<PrimaryActionFAB />)
    expect(container.innerHTML).toBe('')
  })

  it('shows MessageCircle icon on /dashboard', () => {
    render(<PrimaryActionFAB />)
    expect(screen.getByTestId('icon-message')).toBeDefined()
  })

  it('links to /checkin on dashboard', () => {
    render(<PrimaryActionFAB />)
    const link = screen.getByTestId('fab').closest('a')
    expect(link).not.toBeNull()
    expect(link!.getAttribute('href')).toBe('/checkin')
  })
})

describe('MobileActionBar', () => {
  it('renders action buttons on /dashboard', () => {
    render(<MobileActionBar />)
    expect(screen.getByText('Check-in')).toBeDefined()
    expect(screen.getByText('Add Note')).toBeDefined()
  })

  it('returns null on unmatched route', () => {
    mockUsePathname.mockReturnValue('/unknown')
    const { container } = render(<MobileActionBar />)
    expect(container.innerHTML).toBe('')
  })

  it('shows Start Check-in label for dashboard FAB', () => {
    render(<PrimaryActionFAB />)
    const fab = screen.getByTestId('fab')
    expect(fab).toBeDefined()
    // The FAB on dashboard should contain the MessageCircle icon for "Start Check-in"
    expect(screen.getByTestId('icon-message')).toBeDefined()
  })
})
