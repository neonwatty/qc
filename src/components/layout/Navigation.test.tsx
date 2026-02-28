import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type React from 'react'

const mockPathname = vi.fn(() => '/dashboard')

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('lucide-react', () => ({
  Home: () => <span data-testid="icon-home" />,
  MessageCircle: () => <span data-testid="icon-message-circle" />,
  StickyNote: () => <span data-testid="icon-sticky-note" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  Settings: () => <span data-testid="icon-settings" />,
  Menu: () => <span data-testid="icon-menu" />,
  X: () => <span data-testid="icon-x" />,
  Bell: () => <span data-testid="icon-bell" />,
  Heart: () => <span data-testid="icon-heart" />,
  HeartHandshake: () => <span data-testid="icon-heart-handshake" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/sign-out-button', () => ({
  SignOutButton: () => <div data-testid="sign-out-button" />,
}))

const { Navigation } = await import('./Navigation')

beforeEach(() => {
  vi.clearAllMocks()
  mockPathname.mockReturnValue('/dashboard')
})

describe('Navigation', () => {
  it('renders all 8 navigation item names', () => {
    render(<Navigation />)
    const names = ['Dashboard', 'Check-in', 'Notes', 'Growth', 'Reminders', 'Love Languages', 'Requests', 'Settings']
    for (const name of names) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
  })

  it('renders links with correct href attributes', () => {
    render(<Navigation />)
    const hrefs = [
      '/dashboard',
      '/checkin',
      '/notes',
      '/growth',
      '/reminders',
      '/love-languages',
      '/requests',
      '/settings',
    ]
    for (const href of hrefs) {
      const links = screen.getAllByRole('link').filter((el) => el.getAttribute('href') === href)
      expect(links.length).toBeGreaterThan(0)
    }
  })

  it('renders SignOutButton', () => {
    render(<Navigation />)
    expect(screen.getAllByTestId('sign-out-button').length).toBeGreaterThan(0)
  })

  it('renders More button text in mobile bottom nav', () => {
    render(<Navigation />)
    expect(screen.getByText('More')).toBeDefined()
  })

  it('renders Menu heading text when mobile sidebar is opened', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByText('More'))
    expect(screen.getByText('Menu')).toBeDefined()
  })

  it('opens mobile sidebar when More button is clicked', () => {
    render(<Navigation />)
    expect(screen.queryByText('Menu')).toBeNull()
    fireEvent.click(screen.getByText('More'))
    expect(screen.getByText('Menu')).toBeDefined()
  })

  it('closes mobile sidebar when X button is clicked', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByText('More'))
    expect(screen.getByText('Menu')).toBeDefined()
    const xIcon = screen.getByTestId('icon-x')
    fireEvent.click(xIcon.closest('button')!)
    expect(screen.queryByText('Menu')).toBeNull()
  })

  it('renders navigation items as links', () => {
    render(<Navigation />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute('href')).toBeDefined()
    }
  })
})
