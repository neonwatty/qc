import { describe, it, expect, vi } from 'vitest'

import { computeScore, calculateGrowthScores } from '@/lib/growth-scoring'

describe('computeScore', () => {
  it('returns 0 when all actuals are zero', () => {
    expect(computeScore([{ actual: 0, max: 10, weight: 100 }])).toBe(0)
  })

  it('returns 100 when all metrics are at max', () => {
    const result = computeScore([
      { actual: 10, max: 10, weight: 50 },
      { actual: 5, max: 5, weight: 50 },
    ])
    expect(result).toBe(100)
  })

  it('caps ratio at 1.0 when actual exceeds max', () => {
    expect(computeScore([{ actual: 20, max: 10, weight: 100 }])).toBe(100)
  })

  it('calculates weighted partial scores correctly', () => {
    // 5/10 * 60 = 30, 3/5 * 40 = 24 => 54
    const result = computeScore([
      { actual: 5, max: 10, weight: 60 },
      { actual: 3, max: 5, weight: 40 },
    ])
    expect(result).toBe(54)
  })
})

describe('calculateGrowthScores', () => {
  it('returns 5 areas with correct area names', async () => {
    function mockChain(): Record<string, unknown> {
      const chain: Record<string, unknown> = {}
      const methods = ['select', 'eq', 'not', 'filter']
      for (const m of methods) {
        // eslint-disable-next-line security/detect-object-injection -- m is from a known string array
        chain[m] = vi.fn().mockReturnValue(chain)
      }
      chain['then'] = (resolve: (v: { count: number }) => void) => resolve({ count: 0 })
      return chain
    }

    const supabase = {
      from: vi.fn().mockReturnValue(mockChain()),
    } as never

    const scores = await calculateGrowthScores('couple-123', supabase)

    expect(scores).toHaveLength(5)
    const areas = scores.map((s) => s.area)
    expect(areas).toEqual([
      'communication',
      'emotional-connection',
      'conflict-resolution',
      'future-planning',
      'intimacy',
    ])
  })
})
