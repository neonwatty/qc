import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('lucide-react', () => ({
  Flame: () => <span data-testid="flame-icon" />,
}))

vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: (val: number) => val,
}))

vi.mock('@/lib/streaks', () => ({
  getAchievedMilestone: vi.fn(),
}))

const { StreakDisplay } = await import('./StreakDisplay')
const { getAchievedMilestone } = await import('@/lib/streaks')

const mockGetAchievedMilestone = vi.mocked(getAchievedMilestone)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('StreakDisplay', () => {
  const baseData = { currentStreak: 5, longestStreak: 10, lastCheckInDate: null, totalCheckIns: 20 }

  it('renders animated streak count', () => {
    mockGetAchievedMilestone.mockReturnValue(null)
    render(<StreakDisplay streakData={baseData} />)
    expect(screen.getByText('5')).toBeDefined()
  })

  it('shows "week" singular when currentStreak is 1', () => {
    mockGetAchievedMilestone.mockReturnValue(null)
    render(<StreakDisplay streakData={{ ...baseData, currentStreak: 1 }} />)
    expect(screen.getByText('week')).toBeDefined()
  })

  it('shows "weeks" plural when currentStreak > 1', () => {
    mockGetAchievedMilestone.mockReturnValue(null)
    render(<StreakDisplay streakData={baseData} />)
    expect(screen.getByText('weeks')).toBeDefined()
  })

  it('shows streak message when active', () => {
    mockGetAchievedMilestone.mockReturnValue(null)
    render(<StreakDisplay streakData={baseData} />)
    expect(screen.getByText('5 week streak!')).toBeDefined()
  })

  it('shows "Start your streak!" when currentStreak is 0', () => {
    mockGetAchievedMilestone.mockReturnValue(null)
    render(<StreakDisplay streakData={{ ...baseData, currentStreak: 0 }} />)
    expect(screen.getByText('Start your streak!')).toBeDefined()
  })

  it('shows milestone badge when getAchievedMilestone returns truthy', () => {
    mockGetAchievedMilestone.mockReturnValue({ weeks: 4, label: '1 Month', emoji: '\u{1F525}' })
    render(<StreakDisplay streakData={baseData} />)
    expect(screen.getByText('1 Month', { exact: false })).toBeDefined()
  })

  it('shows longestStreak and totalCheckIns stats', () => {
    mockGetAchievedMilestone.mockReturnValue(null)
    render(<StreakDisplay streakData={baseData} />)
    expect(screen.getByText('10')).toBeDefined()
    expect(screen.getByText('Longest Streak')).toBeDefined()
    expect(screen.getByText('20')).toBeDefined()
    expect(screen.getByText('Total Check-ins')).toBeDefined()
  })
})
