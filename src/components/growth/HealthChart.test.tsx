import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import type { MoodDataPoint } from '@/lib/chart-data'

vi.mock('framer-motion', () => {
  function MotionDiv({ children, ...props }: Record<string, unknown>) {
    const { initial, animate, exit, transition, whileTap, ...htmlProps } = props
    void initial
    void animate
    void exit
    void transition
    void whileTap
    return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
  }

  return {
    motion: {
      div: MotionDiv,
    },
  }
})

vi.mock('recharts', () => ({
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Legend: () => <div data-testid="legend" />,
  Line: (props: Record<string, unknown>) => <div data-testid={`line-${props.dataKey}`} />,
  LineChart: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="line-chart" data-data={JSON.stringify(props.data)}>
      {children}
    </div>
  ),
  ResponsiveContainer: ({ children }: React.PropsWithChildren) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
}))

const { HealthChart } = await import('./HealthChart')

const sampleData: MoodDataPoint[] = [
  { date: 'Jan 1', moodBefore: 3, moodAfter: 4 },
  { date: 'Jan 8', moodBefore: 2, moodAfter: 4 },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('HealthChart', () => {
  it('shows "Mood Over Time" heading with empty data', () => {
    render(<HealthChart data={[]} />)
    expect(screen.getByText('Mood Over Time')).toBeDefined()
  })

  it('shows "No mood data yet" with empty data array', () => {
    render(<HealthChart data={[]} />)
    expect(screen.getByText('No mood data yet')).toBeDefined()
  })

  it('does not render chart components with empty data', () => {
    render(<HealthChart data={[]} />)
    expect(screen.queryByTestId('line-chart')).toBeNull()
    expect(screen.queryByTestId('responsive-container')).toBeNull()
  })

  it('renders chart with data', () => {
    render(<HealthChart data={sampleData} />)
    expect(screen.getByTestId('line-chart')).toBeDefined()
    expect(screen.getByTestId('responsive-container')).toBeDefined()
  })

  it('renders moodBefore and moodAfter lines', () => {
    render(<HealthChart data={sampleData} />)
    expect(screen.getByTestId('line-moodBefore')).toBeDefined()
    expect(screen.getByTestId('line-moodAfter')).toBeDefined()
  })

  it('passes className to Card', () => {
    const { container } = render(<HealthChart data={[]} className="custom-class" />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('custom-class')
  })
})
