import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { calculateStreakFromDates, getISOWeekKey, getAchievedMilestone, STREAK_MILESTONES } from './streaks'

// Helper: create a date string for a given number of weeks ago (from the fake "now")
function weeksAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  return d.toISOString()
}

// Helper: create a date string for a specific day within the current week
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

describe('streaks', () => {
  beforeEach(() => {
    // Fix time to a Wednesday to avoid week boundary edge cases
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-03-12T12:00:00Z')) // A Wednesday
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getISOWeekKey', () => {
    it('returns correct ISO week format', () => {
      expect(getISOWeekKey(new Date('2025-03-12'))).toBe('2025-W11')
    })

    it('handles year boundary', () => {
      expect(getISOWeekKey(new Date('2025-01-01'))).toBe('2025-W01')
    })
  })

  describe('calculateStreakFromDates', () => {
    it('returns streak 0 for no check-ins', () => {
      const result = calculateStreakFromDates([])
      expect(result.currentStreak).toBe(0)
      expect(result.longestStreak).toBe(0)
      expect(result.lastCheckInDate).toBeNull()
      expect(result.totalCheckIns).toBe(0)
    })

    it('returns streak 1 for one check-in this week', () => {
      const result = calculateStreakFromDates([daysAgo(1)])
      expect(result.currentStreak).toBe(1)
      expect(result.longestStreak).toBe(1)
      expect(result.totalCheckIns).toBe(1)
    })

    it('returns streak 4 for check-ins every week for 4 weeks', () => {
      const dates = [weeksAgo(0), weeksAgo(1), weeksAgo(2), weeksAgo(3)]
      const result = calculateStreakFromDates(dates)
      expect(result.currentStreak).toBe(4)
      expect(result.longestStreak).toBe(4)
    })

    it('gap breaks current streak', () => {
      // Check-in this week, last week, then 3 weeks ago (skipped 2 weeks ago)
      const dates = [weeksAgo(0), weeksAgo(1), weeksAgo(3)]
      const result = calculateStreakFromDates(dates)
      expect(result.currentStreak).toBe(2)
      expect(result.longestStreak).toBe(2)
    })

    it('tracks longest streak separately from current', () => {
      // Old streak of 5 weeks, then a gap, then current streak of 2
      const dates = [
        weeksAgo(0),
        weeksAgo(1), // current streak = 2
        // gap at weeksAgo(2)
        weeksAgo(3),
        weeksAgo(4),
        weeksAgo(5),
        weeksAgo(6),
        weeksAgo(7), // old streak = 5
      ]
      const result = calculateStreakFromDates(dates)
      expect(result.currentStreak).toBe(2)
      expect(result.longestStreak).toBe(5)
    })

    it('multiple check-ins in one week count as one week', () => {
      const dates = [daysAgo(0), daysAgo(1), daysAgo(2)] // all in same week
      const result = calculateStreakFromDates(dates)
      expect(result.currentStreak).toBe(1)
      expect(result.totalCheckIns).toBe(3) // total is still 3
    })

    it('streak starts from most recent week if not current week', () => {
      // No check-in this week, but last week and week before
      const dates = [weeksAgo(1), weeksAgo(2)]
      const result = calculateStreakFromDates(dates)
      expect(result.currentStreak).toBe(2)
    })

    it('returns lastCheckInDate as the most recent date', () => {
      const recent = daysAgo(0)
      const older = weeksAgo(2)
      const result = calculateStreakFromDates([older, recent])
      expect(result.lastCheckInDate).toBe(recent)
    })
  })

  describe('getAchievedMilestone', () => {
    it('returns null for streaks below 4 weeks', () => {
      expect(getAchievedMilestone(0)).toBeNull()
      expect(getAchievedMilestone(3)).toBeNull()
    })

    it('returns 1 Month milestone at 4 weeks', () => {
      const milestone = getAchievedMilestone(4)
      expect(milestone?.label).toBe('1 Month')
    })

    it('returns highest applicable milestone', () => {
      const milestone = getAchievedMilestone(30)
      expect(milestone?.label).toBe('6 Months')
    })

    it('returns 1 Year for 52+ weeks', () => {
      const milestone = getAchievedMilestone(52)
      expect(milestone?.label).toBe('1 Year')
    })
  })

  describe('STREAK_MILESTONES', () => {
    it('has 5 milestones in ascending order', () => {
      expect(STREAK_MILESTONES).toHaveLength(5)
      for (let i = 1; i < STREAK_MILESTONES.length; i++) {
        // eslint-disable-next-line security/detect-object-injection -- i is a numeric loop index
        expect(STREAK_MILESTONES[i].weeks).toBeGreaterThan(STREAK_MILESTONES[i - 1].weeks)
      }
    })
  })
})
