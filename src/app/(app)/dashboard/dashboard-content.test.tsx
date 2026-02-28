import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn(), push: vi.fn() })),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('lucide-react', () => ({ Heart: () => <span data-testid="icon-heart" /> }))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))
vi.mock('@/components/layout/PageContainer', () => ({
  PageContainer: ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode
    title: string
    description?: string
  }) => (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}))
vi.mock('@/components/dashboard/QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions" />,
}))
vi.mock('@/components/dashboard/StreakDisplay', () => ({
  StreakDisplay: () => <div data-testid="streak-display" />,
}))
vi.mock('@/components/dashboard/StatsGrid', () => ({
  StatsGrid: () => <div data-testid="stats-grid" />,
}))
vi.mock('@/components/dashboard/LoveLanguagesWidget', () => ({
  LoveLanguagesWidget: () => <div data-testid="love-languages-widget" />,
}))
vi.mock('@/components/dashboard/PrepBanner', () => ({
  PrepBanner: () => <div data-testid="prep-banner" />,
}))
vi.mock('@/components/dashboard/TodayReminders', () => ({
  TodayReminders: () => <div data-testid="today-reminders" />,
}))
vi.mock('@/components/dashboard/RecentActivity', () => ({
  RecentActivity: () => <div data-testid="recent-activity" />,
}))

const { DashboardContent } = await import('./dashboard-content')

function defaultProps() {
  return {
    checkInCount: 0,
    noteCount: 0,
    milestoneCount: 0,
    actionItemCount: 0,
    totalLanguages: 0,
    sharedLanguages: 0,
    hasCoupleId: true,
    streakData: { currentStreak: 0, longestStreak: 0, lastCheckInDate: null, totalCheckIns: 0 },
    activities: [],
    relationshipStartDate: null,
    lastCheckInDate: null,
    topLanguages: [],
    todayReminders: [],
    pendingRequestCount: 0,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardContent', () => {
  it('renders Dashboard title', () => {
    render(<DashboardContent {...defaultProps()} />)
    expect(screen.getByText('Dashboard')).toBeDefined()
  })

  it('renders description', () => {
    render(<DashboardContent {...defaultProps()} />)
    expect(screen.getByText('Your relationship command center')).toBeDefined()
  })

  it('shows connect prompt when hasCoupleId is false', () => {
    render(<DashboardContent {...defaultProps()} hasCoupleId={false} />)
    expect(screen.getByText('Connect with your partner')).toBeDefined()
  })

  it('shows Invite Partner link when hasCoupleId is false', () => {
    render(<DashboardContent {...defaultProps()} hasCoupleId={false} />)
    expect(screen.getByText('Invite Partner')).toBeDefined()
  })

  it('does NOT show connect prompt when hasCoupleId is true', () => {
    render(<DashboardContent {...defaultProps()} hasCoupleId={true} />)
    expect(screen.queryByText('Connect with your partner')).toBeNull()
  })

  it('renders QuickActions component', () => {
    render(<DashboardContent {...defaultProps()} />)
    expect(screen.getByTestId('quick-actions')).toBeDefined()
  })

  it('renders StreakDisplay component', () => {
    render(<DashboardContent {...defaultProps()} />)
    expect(screen.getByTestId('streak-display')).toBeDefined()
  })

  it('renders StatsGrid component', () => {
    render(<DashboardContent {...defaultProps()} />)
    expect(screen.getByTestId('stats-grid')).toBeDefined()
  })
})
