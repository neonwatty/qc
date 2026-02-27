import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { CATEGORY_CONFIG, RARITY_CONFIG, formatMilestoneDate } from './milestone-card-config'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-08-15T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CATEGORY_CONFIG', () => {
  it('has entries for all 7 categories', () => {
    const keys = Object.keys(CATEGORY_CONFIG)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('communication')
    expect(keys).toContain('intimacy')
    expect(keys).toContain('growth')
    expect(keys).toContain('relationship')
    expect(keys).toContain('adventure')
    expect(keys).toContain('milestone')
    expect(keys).toContain('custom')
  })

  it('each category has required style properties', () => {
    for (const config of Object.values(CATEGORY_CONFIG)) {
      expect(config.color).toBeDefined()
      expect(config.bgColor).toBeDefined()
      expect(config.borderColor).toBeDefined()
      expect(config.gradientFrom).toBeDefined()
      expect(config.gradientTo).toBeDefined()
      expect(config.icon).toBeDefined()
    }
  })
})

describe('RARITY_CONFIG', () => {
  it('has entries for all 4 rarities', () => {
    const keys = Object.keys(RARITY_CONFIG)
    expect(keys).toHaveLength(4)
    expect(keys).toContain('common')
    expect(keys).toContain('rare')
    expect(keys).toContain('epic')
    expect(keys).toContain('legendary')
  })

  it('each rarity has borderColor and badgeColor', () => {
    for (const config of Object.values(RARITY_CONFIG)) {
      expect(config.borderColor).toBeDefined()
      expect(config.badgeColor).toBeDefined()
    }
  })
})

describe('formatMilestoneDate', () => {
  it('formats date in current year without year', () => {
    expect(formatMilestoneDate('2025-03-15T12:00:00Z')).toBe('Mar 15')
  })

  it('formats date in different year with year', () => {
    expect(formatMilestoneDate('2023-12-25T12:00:00Z')).toBe('Dec 25, 2023')
  })

  it('formats date at year boundary', () => {
    expect(formatMilestoneDate('2024-01-01T12:00:00Z')).toBe('Jan 1, 2024')
  })
})
