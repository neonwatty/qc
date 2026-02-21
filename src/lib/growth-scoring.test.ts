import { describe, expect, it } from 'vitest'

import { computeScore } from '@/lib/growth-scoring'

describe('computeScore', () => {
  it('returns 0 when all actuals are 0', () => {
    const result = computeScore([
      { actual: 0, max: 10, weight: 40 },
      { actual: 0, max: 20, weight: 30 },
      { actual: 0, max: 10, weight: 30 },
    ])
    expect(result).toBe(0)
  })

  it('returns 100 when all metrics are at max', () => {
    const result = computeScore([
      { actual: 10, max: 10, weight: 40 },
      { actual: 20, max: 20, weight: 30 },
      { actual: 10, max: 10, weight: 30 },
    ])
    expect(result).toBe(100)
  })

  it('caps individual metrics at 1x max (no bonus for exceeding)', () => {
    const result = computeScore([
      { actual: 50, max: 10, weight: 40 },
      { actual: 100, max: 20, weight: 30 },
      { actual: 99, max: 10, weight: 30 },
    ])
    expect(result).toBe(100)
  })

  it('calculates partial scores correctly', () => {
    // 5/10 * 40 = 20, 10/20 * 30 = 15, 5/10 * 30 = 15 => 50
    const result = computeScore([
      { actual: 5, max: 10, weight: 40 },
      { actual: 10, max: 20, weight: 30 },
      { actual: 5, max: 10, weight: 30 },
    ])
    expect(result).toBe(50)
  })

  it('rounds to nearest integer', () => {
    // 3/10 * 40 = 12, 7/20 * 30 = 10.5, 2/10 * 30 = 6 => 28.5 => 29
    const result = computeScore([
      { actual: 3, max: 10, weight: 40 },
      { actual: 7, max: 20, weight: 30 },
      { actual: 2, max: 10, weight: 30 },
    ])
    expect(result).toBe(29)
  })

  it('handles two-metric areas (conflict resolution pattern)', () => {
    // 10/10 * 50 = 50, 0/5 * 50 = 0 => 50
    const result = computeScore([
      { actual: 10, max: 10, weight: 50 },
      { actual: 0, max: 5, weight: 50 },
    ])
    expect(result).toBe(50)
  })

  it('handles single metric', () => {
    // 3/5 * 100 = 60
    const result = computeScore([{ actual: 3, max: 5, weight: 100 }])
    expect(result).toBe(60)
  })

  it('handles empty metrics array', () => {
    const result = computeScore([])
    expect(result).toBe(0)
  })

  it('never exceeds 100 even with weights summing over 100', () => {
    const result = computeScore([
      { actual: 10, max: 10, weight: 80 },
      { actual: 10, max: 10, weight: 80 },
    ])
    expect(result).toBe(100)
  })

  it('calculates a realistic emotional connection score', () => {
    // 2 improved moods out of 5 max * 40 = 16
    // 3 shared love languages out of 5 max * 30 = 18
    // 1 reflection out of 5 max * 30 = 6
    // total = 40
    const result = computeScore([
      { actual: 2, max: 5, weight: 40 },
      { actual: 3, max: 5, weight: 30 },
      { actual: 1, max: 5, weight: 30 },
    ])
    expect(result).toBe(40)
  })

  it('calculates a realistic future planning score', () => {
    // 5 milestones (maxed) * 40 = 40
    // 3 reminders out of 10 max * 30 = 9
    // 5 incomplete items (maxed) * 30 = 30
    // total = 79
    const result = computeScore([
      { actual: 5, max: 5, weight: 40 },
      { actual: 3, max: 10, weight: 30 },
      { actual: 5, max: 5, weight: 30 },
    ])
    expect(result).toBe(79)
  })
})
