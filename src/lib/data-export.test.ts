import { describe, it, expect, vi } from 'vitest'

import { exportUserData } from '@/lib/data-export'

const userId = 'user-1'
const coupleId = 'couple-1'

const mockProfile = {
  id: userId,
  display_name: 'Test User',
  email: 'test@example.com',
  couple_id: coupleId,
}

const mockCouple = {
  id: coupleId,
  relationship_start_date: '2024-06-01',
  settings: { theme: 'pink' },
}

function createChain(resolveValue: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnValue(resolveValue),
    single: vi.fn().mockReturnValue(resolveValue),
  }
  return chain
}

function createMockSupabase(tableMap: Record<string, ReturnType<typeof createChain>>) {
  return {
    from: vi.fn((table: string) => tableMap[table] ?? createChain({ data: [], error: null })),
  } as unknown as Parameters<typeof exportUserData>[0]
}

function emptyArrayChain() {
  return createChain({ data: [], error: null })
}

describe('exportUserData', () => {
  it('returns error when profile not found', async () => {
    const tables = { profiles: createChain({ data: null, error: null }) }
    const supabase = createMockSupabase(tables)

    const result = await exportUserData(supabase, userId)

    expect(result).toEqual({ data: null, error: 'Profile not found' })
  })

  it('exports profile data successfully', async () => {
    const profileNoCouple = { ...mockProfile, couple_id: null }
    const tables: Record<string, ReturnType<typeof createChain>> = {
      profiles: createChain({ data: profileNoCouple, error: null }),
      notes: emptyArrayChain(),
      reminders: emptyArrayChain(),
      requests: emptyArrayChain(),
      love_languages: emptyArrayChain(),
    }
    const supabase = createMockSupabase(tables)

    const result = await exportUserData(supabase, userId)

    expect(result.error).toBeNull()
    expect(result.data).not.toBeNull()
    expect(result.data!.version).toBe('1.0.0')
    expect(result.data!.exportedAt).toBeDefined()
    expect(result.data!.profile).toEqual({
      id: userId,
      display_name: 'Test User',
      email: 'test@example.com',
    })
  })

  it('includes couple data when user has a couple', async () => {
    const tables: Record<string, ReturnType<typeof createChain>> = {
      profiles: createChain({ data: mockProfile, error: null }),
      couples: createChain({ data: mockCouple, error: null }),
      notes: emptyArrayChain(),
      check_ins: emptyArrayChain(),
      action_items: emptyArrayChain(),
      milestones: emptyArrayChain(),
      reminders: emptyArrayChain(),
      requests: emptyArrayChain(),
      love_languages: emptyArrayChain(),
      love_actions: emptyArrayChain(),
    }
    const supabase = createMockSupabase(tables)

    const result = await exportUserData(supabase, userId)

    expect(result.error).toBeNull()
    expect(result.data!.couple).toEqual(mockCouple)
  })

  it('returns empty arrays for couple-scoped data when no couple', async () => {
    const profileNoCouple = { ...mockProfile, couple_id: null }
    const tables: Record<string, ReturnType<typeof createChain>> = {
      profiles: createChain({ data: profileNoCouple, error: null }),
      notes: emptyArrayChain(),
      reminders: emptyArrayChain(),
      requests: emptyArrayChain(),
      love_languages: emptyArrayChain(),
    }
    const supabase = createMockSupabase(tables)

    const result = await exportUserData(supabase, userId)

    expect(result.error).toBeNull()
    expect(result.data!.couple).toBeNull()
    expect(result.data!.checkIns).toEqual([])
    expect(result.data!.actionItems).toEqual([])
    expect(result.data!.milestones).toEqual([])
    expect(result.data!.loveActions).toEqual([])
  })

  it('catches thrown errors and returns error message', async () => {
    const supabase = {
      from: vi.fn().mockImplementation(() => {
        throw new Error('Connection failed')
      }),
    } as unknown as Parameters<typeof exportUserData>[0]

    const result = await exportUserData(supabase, userId)

    expect(result).toEqual({ data: null, error: 'Connection failed' })
  })
})
