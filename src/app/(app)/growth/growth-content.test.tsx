import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('@/hooks/useMilestones', () => ({
  useMilestones: vi.fn(() => ({
    milestones: [],
    isLoading: false,
    error: null,
    createMilestone: vi.fn(),
    updateMilestone: vi.fn(),
    deleteMilestone: vi.fn(),
    achieveMilestone: vi.fn(),
    uploadPhoto: vi.fn(),
    getMilestonesByCategory: vi.fn(() => []),
    getAchievedMilestones: vi.fn(() => []),
    getUpcomingMilestones: vi.fn(() => []),
    refresh: vi.fn(),
  })),
}))
vi.mock('@/hooks/useRealtimeCouple', () => ({ useRealtimeCouple: vi.fn() }))
vi.mock('@/components/ui/motion', () => ({
  MotionBox: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerContainer: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/layout/PageContainer', () => ({
  PageContainer: ({ children, title, action }: Record<string, unknown>) => (
    <div>
      <h1>{title as string}</h1>
      {action as React.ReactNode}
      {children as React.ReactNode}
    </div>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))
vi.mock('@/components/growth', () => ({
  Timeline: () => <div data-testid="timeline" />,
  PhotoGallery: () => <div data-testid="photo-gallery" />,
  MilestoneCreator: () => <div data-testid="milestone-creator" />,
}))
vi.mock('@/components/growth/GrowthProgressBars', () => ({
  GrowthProgressBars: () => <div data-testid="growth-bars" />,
}))
vi.mock('@/components/growth/HealthChart', () => ({
  HealthChart: () => <div data-testid="health-chart" />,
}))
vi.mock('lucide-react', () => ({
  TrendingUp: () => <span data-testid="icon-trending" />,
  Award: () => <span />,
  Target: () => <span />,
  Camera: () => <span />,
  Plus: () => <span />,
  BarChart3: () => <span />,
}))

import { render, screen, fireEvent } from '@testing-library/react'
import { useMilestones } from '@/hooks/useMilestones'

const { GrowthContent } = await import('./growth-content')

const defaultProps = {
  coupleId: 'couple-1',
  growthScores: [],
  moodHistory: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GrowthContent', () => {
  it('renders "Connect with your partner" when coupleId is null', () => {
    render(<GrowthContent {...defaultProps} coupleId={null} />)
    expect(screen.getByText('Connect with your partner')).toBeDefined()
  })

  it('renders "Growth Gallery" title when coupleId provided', () => {
    render(<GrowthContent {...defaultProps} />)
    expect(screen.getByText('Growth Gallery')).toBeDefined()
  })

  it('renders StatsGrid with correct counts from milestones', () => {
    vi.mocked(useMilestones).mockReturnValue({
      milestones: [
        {
          id: '1',
          coupleId: 'c1',
          title: 'M1',
          description: null,
          category: 'growth',
          icon: null,
          achievedAt: '2025-01-01',
          rarity: 'common',
          points: 10,
          photoUrl: 'url',
        },
        {
          id: '2',
          coupleId: 'c1',
          title: 'M2',
          description: null,
          category: 'growth',
          icon: null,
          achievedAt: null,
          rarity: 'rare',
          points: 20,
          photoUrl: null,
        },
      ],
      isLoading: false,
      error: null,
      createMilestone: vi.fn(),
      updateMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
      achieveMilestone: vi.fn(),
      uploadPhoto: vi.fn(),
      getMilestonesByCategory: vi.fn(() => []),
      getAchievedMilestones: vi.fn(() => [{ id: '1' }] as never[]),
      getUpcomingMilestones: vi.fn(() => [{ id: '2' }] as never[]),
      refresh: vi.fn(),
    })
    render(<GrowthContent {...defaultProps} />)
    expect(screen.getByText('30')).toBeDefined() // total points
    expect(screen.getByText('Milestones Reached')).toBeDefined()
    expect(screen.getByText('Photos')).toBeDefined()
  })

  it('renders Timeline button in view toggle', () => {
    render(<GrowthContent {...defaultProps} />)
    expect(screen.getByText('Timeline')).toBeDefined()
  })

  it('renders timeline view by default', () => {
    render(<GrowthContent {...defaultProps} />)
    expect(screen.getByTestId('timeline')).toBeDefined()
  })

  it('clicking Progress shows ProgressView content', () => {
    render(<GrowthContent {...defaultProps} />)
    fireEvent.click(screen.getByText('Progress'))
    expect(screen.getByText('Upcoming Milestones')).toBeDefined()
  })

  it('renders New Milestone button', () => {
    render(<GrowthContent {...defaultProps} />)
    expect(screen.getByText('New Milestone')).toBeDefined()
  })

  it('shows loading spinner when isLoading is true', () => {
    vi.mocked(useMilestones).mockReturnValue({
      milestones: [],
      isLoading: true,
      error: null,
      createMilestone: vi.fn(),
      updateMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
      achieveMilestone: vi.fn(),
      uploadPhoto: vi.fn(),
      getMilestonesByCategory: vi.fn(() => []),
      getAchievedMilestones: vi.fn(() => []),
      getUpcomingMilestones: vi.fn(() => []),
      refresh: vi.fn(),
    })
    const { container } = render(<GrowthContent {...defaultProps} />)
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })
})
