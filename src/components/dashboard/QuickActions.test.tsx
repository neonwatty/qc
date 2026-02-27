import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('lucide-react', () => ({
  MessageCircle: () => <span data-testid="icon-message" />,
  StickyNote: () => <span data-testid="icon-note" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  Bell: () => <span data-testid="icon-bell" />,
  Heart: () => <span data-testid="icon-heart" />,
  HeartHandshake: () => <span data-testid="icon-handshake" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children as React.ReactNode}</button>
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>
      {children as React.ReactNode}
    </a>
  ),
}))

const { QuickActions } = await import('./QuickActions')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('QuickActions', () => {
  const labels = ['Start Check-in', 'View Notes', 'Growth Gallery', 'Reminders', 'Love Languages', 'Requests']
  const hrefs = ['/checkin', '/notes', '/growth', '/reminders', '/love-languages', '/requests']

  it('renders all 6 action labels', () => {
    render(<QuickActions />)
    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each action links to correct href', () => {
    render(<QuickActions />)
    const links = screen.getAllByRole('link')
    const linkHrefs = links.map((link) => link.getAttribute('href'))
    for (const href of hrefs) {
      expect(linkHrefs).toContain(href)
    }
  })

  it('shows descriptions for each action', () => {
    render(<QuickActions />)
    expect(screen.getByText('Begin a new relationship check-in session')).toBeDefined()
    expect(screen.getByText('Review your shared and private notes')).toBeDefined()
    expect(screen.getByText('Track your relationship progress')).toBeDefined()
    expect(screen.getByText('Manage your personal reminders')).toBeDefined()
    expect(screen.getByText('Express love in meaningful ways')).toBeDefined()
    expect(screen.getByText('Partner requests and suggestions')).toBeDefined()
  })

  it('primary action "Start Check-in" exists', () => {
    render(<QuickActions />)
    expect(screen.getAllByText('Start Check-in').length).toBeGreaterThanOrEqual(1)
  })

  it('renders 6 buttons total', () => {
    render(<QuickActions />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(6)
  })

  it('passes className to container', () => {
    const { container } = render(<QuickActions className="test-class" />)
    const outerDiv = container.firstElementChild as HTMLElement
    expect(outerDiv.className).toContain('test-class')
  })
})
