import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StatsGrid } from './StatsGrid'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('StatsGrid', () => {
  it('renders all stat labels', () => {
    render(<StatsGrid />)
    expect(screen.getByText('Check-ins')).toBeDefined()
    expect(screen.getByText('Notes')).toBeDefined()
    expect(screen.getByText('Milestones')).toBeDefined()
    expect(screen.getByText('Action Items')).toBeDefined()
  })

  it('renders numeric values', () => {
    render(<StatsGrid checkInCount={5} noteCount={12} milestoneCount={3} actionItemCount={8} />)
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('12')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('8')).toBeDefined()
  })

  it('displays "Not set" when no relationship start date', () => {
    render(<StatsGrid />)
    expect(screen.getByText('Not set')).toBeDefined()
  })

  it('displays "Never" when no last check-in date', () => {
    render(<StatsGrid />)
    expect(screen.getByText('Never')).toBeDefined()
  })

  it('formats duration in days', () => {
    render(<StatsGrid relationshipStartDate="2025-06-10T00:00:00Z" />)
    expect(screen.getByText('5d')).toBeDefined()
  })

  it('formats duration in months', () => {
    render(<StatsGrid relationshipStartDate="2025-03-15T00:00:00Z" />)
    expect(screen.getByText('3mo')).toBeDefined()
  })

  it('formats duration in years and months', () => {
    render(<StatsGrid relationshipStartDate="2023-01-15T00:00:00Z" />)
    expect(screen.getByText('2y, 5mo')).toBeDefined()
  })

  it('formats last check-in as Today', () => {
    render(<StatsGrid lastCheckInDate="2025-06-15T08:00:00Z" />)
    expect(screen.getByText('Today')).toBeDefined()
  })
})
