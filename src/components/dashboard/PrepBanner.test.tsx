import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('lucide-react', () => ({
  MessageCircle: () => <span data-testid="icon-message" />,
  X: () => <span data-testid="icon-x" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Clock: () => <span data-testid="icon-clock" />,
}))

vi.mock('@/components/ui/motion', () => ({
  MotionBox: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}))

const { PrepBanner } = await import('./PrepBanner')

const mockSessionStorage: Record<string, string> = {}
beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(mockSessionStorage).forEach((k) => delete mockSessionStorage[k])
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => mockSessionStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockSessionStorage[key] = value
    },
    removeItem: (key: string) => {
      delete mockSessionStorage[key]
    },
    clear: () => {
      Object.keys(mockSessionStorage).forEach((k) => delete mockSessionStorage[k])
    },
    length: 0,
    key: () => null,
  })
})

describe('PrepBanner', () => {
  it('shows "Start your first check-in!" when no lastCheckInDate', () => {
    render(<PrepBanner />)
    expect(screen.getByText('Start your first check-in!')).toBeDefined()
  })

  it('shows "We miss you!" when >= 14 days ago', () => {
    const date = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    render(<PrepBanner lastCheckInDate={date} />)
    expect(screen.getByText('We miss you!')).toBeDefined()
  })

  it('shows "Time for a check-in!" when >= 7 days ago', () => {
    const date = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    render(<PrepBanner lastCheckInDate={date} />)
    expect(screen.getByText('Time for a check-in!')).toBeDefined()
  })

  it('shows "Keep up the momentum!" when < 7 days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    render(<PrepBanner lastCheckInDate={date} />)
    expect(screen.getByText('Keep up the momentum!')).toBeDefined()
  })

  it('shows "Start Check-in" button', () => {
    render(<PrepBanner />)
    expect(screen.getByText('Start Check-in')).toBeDefined()
  })

  it('dismiss button hides the banner', () => {
    render(<PrepBanner />)
    expect(screen.getByText('Start your first check-in!')).toBeDefined()
    fireEvent.click(screen.getByLabelText('Dismiss banner'))
    expect(screen.queryByText('Start your first check-in!')).toBeNull()
  })

  it('shows nothing when already dismissed via sessionStorage', () => {
    mockSessionStorage['qc-prep-banner-dismissed'] = 'true'
    render(<PrepBanner />)
    expect(screen.queryByText('Start your first check-in!')).toBeNull()
  })
})
