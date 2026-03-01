import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { subDays } from 'date-fns'

vi.mock('lucide-react', () => ({
  Flame: () => <span data-testid="icon-flame" />,
  HeartPulse: () => <span data-testid="icon-heartpulse" />,
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, ...props }: React.ComponentProps<'button'> & { variant?: string }) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}))

import { CheckInCard } from './CheckInCard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CheckInCard', () => {
  it('renders heading', () => {
    render(<CheckInCard lastCheckInDate={null} totalCheckIns={0} currentStreak={0} frequencyGoal={null} />)
    expect(screen.getByText('Check-in Health')).toBeDefined()
  })

  it('shows "No check-ins yet" when lastCheckInDate is null', () => {
    render(<CheckInCard lastCheckInDate={null} totalCheckIns={0} currentStreak={0} frequencyGoal={null} />)
    expect(screen.getByText('No check-ins yet')).toBeDefined()
    expect(screen.getByText('Start your first check-in!')).toBeDefined()
  })

  it('shows relative time for recent check-in', () => {
    const twoDaysAgo = subDays(new Date(), 2).toISOString()
    render(<CheckInCard lastCheckInDate={twoDaysAgo} totalCheckIns={5} currentStreak={1} frequencyGoal="weekly" />)
    expect(screen.getByText(/Last check-in: 2 days ago/)).toBeDefined()
  })

  it('shows "Checked in today" when check-in was today', () => {
    const today = new Date().toISOString()
    render(<CheckInCard lastCheckInDate={today} totalCheckIns={3} currentStreak={1} frequencyGoal="weekly" />)
    expect(screen.getByText('Checked in today')).toBeDefined()
  })

  it('shows "Overdue" when past frequency goal', () => {
    const tenDaysAgo = subDays(new Date(), 10).toISOString()
    render(<CheckInCard lastCheckInDate={tenDaysAgo} totalCheckIns={3} currentStreak={0} frequencyGoal="weekly" />)
    expect(screen.getByText(/Overdue by/)).toBeDefined()
  })

  it('shows "Next check-in in X days" when on track', () => {
    const twoDaysAgo = subDays(new Date(), 2).toISOString()
    render(<CheckInCard lastCheckInDate={twoDaysAgo} totalCheckIns={5} currentStreak={1} frequencyGoal="weekly" />)
    expect(screen.getByText(/Next check-in in 5 days/)).toBeDefined()
  })

  it('CTA button links to /checkin', () => {
    render(<CheckInCard lastCheckInDate={null} totalCheckIns={0} currentStreak={0} frequencyGoal={null} />)
    const link = screen.getByText('Start Check-in').closest('a')
    expect(link?.getAttribute('href')).toBe('/checkin')
  })

  it('uses destructive variant when overdue', () => {
    const tenDaysAgo = subDays(new Date(), 10).toISOString()
    render(<CheckInCard lastCheckInDate={tenDaysAgo} totalCheckIns={3} currentStreak={0} frequencyGoal="weekly" />)
    const button = screen.getByText('Start Check-in')
    expect(button.getAttribute('data-variant')).toBe('destructive')
  })

  it('uses default variant when on track', () => {
    const twoDaysAgo = subDays(new Date(), 2).toISOString()
    render(<CheckInCard lastCheckInDate={twoDaysAgo} totalCheckIns={5} currentStreak={1} frequencyGoal="weekly" />)
    const button = screen.getByText('Start Check-in')
    expect(button.getAttribute('data-variant')).toBe('default')
  })

  it('shows streak badge when streak > 0', () => {
    const today = new Date().toISOString()
    render(<CheckInCard lastCheckInDate={today} totalCheckIns={5} currentStreak={3} frequencyGoal="weekly" />)
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('weeks')).toBeDefined()
  })

  it('shows total check-ins count', () => {
    render(<CheckInCard lastCheckInDate={null} totalCheckIns={12} currentStreak={0} frequencyGoal={null} />)
    expect(screen.getByText('12 total')).toBeDefined()
  })

  it('defaults to weekly when frequencyGoal is null', () => {
    // 5 days ago with weekly goal = on track (5 days left = 2 days until next)
    const fiveDaysAgo = subDays(new Date(), 5).toISOString()
    render(<CheckInCard lastCheckInDate={fiveDaysAgo} totalCheckIns={5} currentStreak={1} frequencyGoal={null} />)
    expect(screen.getByText(/Next check-in in 2 days/)).toBeDefined()
  })
})
