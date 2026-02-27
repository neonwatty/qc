import { describe, it, expect, vi, beforeEach } from 'vitest'

import { getCheckInMoodHistory } from './chart-data'

function createMockChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['from', 'select', 'eq', 'gte', 'not']
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  // order is the terminal method that resolves
  chain['order'] = vi.fn().mockResolvedValue({ data: [], error: null })
  return chain
}

let chain: ReturnType<typeof createMockChain>
let mockSupabase: { from: ReturnType<typeof vi.fn> }

beforeEach(() => {
  chain = createMockChain()
  mockSupabase = { from: vi.fn().mockReturnValue(chain) }
})

describe('getCheckInMoodHistory', () => {
  it('returns mapped mood data points', async () => {
    chain['order'] = vi.fn().mockResolvedValue({
      data: [
        { completed_at: '2025-06-15T10:00:00Z', mood_before: 3, mood_after: 5 },
        { completed_at: '2025-07-01T12:00:00Z', mood_before: null, mood_after: 4 },
      ],
      error: null,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getCheckInMoodHistory('couple-1', mockSupabase as any)

    expect(result).toEqual([
      { date: 'Jun 15', moodBefore: 3, moodAfter: 5 },
      { date: 'Jul 1', moodBefore: null, moodAfter: 4 },
    ])
    expect(mockSupabase.from).toHaveBeenCalledWith('check_ins')
    expect(chain['select']).toHaveBeenCalledWith('completed_at, mood_before, mood_after')
    expect(chain['eq']).toHaveBeenCalledWith('couple_id', 'couple-1')
    expect(chain['eq']).toHaveBeenCalledWith('status', 'completed')
  })

  it('returns empty array on error', async () => {
    chain['order'] = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Query failed' },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getCheckInMoodHistory('couple-1', mockSupabase as any)

    expect(result).toEqual([])
  })

  it('returns empty array when data is null without error', async () => {
    chain['order'] = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getCheckInMoodHistory('couple-1', mockSupabase as any)

    expect(result).toEqual([])
  })

  it('uses default 3 months cutoff', async () => {
    chain['order'] = vi.fn().mockResolvedValue({ data: [], error: null })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getCheckInMoodHistory('couple-1', mockSupabase as any)

    expect(chain['gte']).toHaveBeenCalledWith('completed_at', expect.any(String))
    expect(chain['not']).toHaveBeenCalledWith('completed_at', 'is', null)
    expect(chain['order']).toHaveBeenCalledWith('completed_at', { ascending: true })
  })
})
