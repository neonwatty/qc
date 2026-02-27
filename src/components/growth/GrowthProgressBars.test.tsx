import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

const { GrowthProgressBars } = await import('./GrowthProgressBars')

const scores = [
  { area: 'Communication skills', label: 'Communication', score: 75, color: '#f472b6' },
  { area: 'Quality time together', label: 'Quality Time', score: 40, color: '#818cf8' },
  { area: 'Emotional support', label: 'Support', score: 90, color: '#34d399' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GrowthProgressBars', () => {
  it('shows "Growth Areas" heading', () => {
    render(<GrowthProgressBars scores={scores} />)
    expect(screen.getByText('Growth Areas')).toBeDefined()
  })

  it('renders label for each score item', () => {
    render(<GrowthProgressBars scores={scores} />)
    expect(screen.getByText('Communication')).toBeDefined()
    expect(screen.getByText('Quality Time')).toBeDefined()
    expect(screen.getByText('Support')).toBeDefined()
  })

  it('renders area text for each score item', () => {
    render(<GrowthProgressBars scores={scores} />)
    expect(screen.getByText('Communication skills')).toBeDefined()
    expect(screen.getByText('Quality time together')).toBeDefined()
    expect(screen.getByText('Emotional support')).toBeDefined()
  })

  it('shows percentage text for each score', () => {
    render(<GrowthProgressBars scores={scores} />)
    expect(screen.getByText('75%')).toBeDefined()
    expect(screen.getByText('40%')).toBeDefined()
    expect(screen.getByText('90%')).toBeDefined()
  })

  it('renders progress bars with correct width style', () => {
    const { container } = render(<GrowthProgressBars scores={scores} />)
    const bars = container.querySelectorAll('.h-full.rounded-full')
    expect(bars).toHaveLength(3)
    expect((bars[0] as HTMLElement).style.width).toBe('75%')
    expect((bars[1] as HTMLElement).style.width).toBe('40%')
    expect((bars[2] as HTMLElement).style.width).toBe('90%')
  })

  it('passes className to Card', () => {
    const { container } = render(<GrowthProgressBars scores={scores} className="custom-class" />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('custom-class')
  })
})
