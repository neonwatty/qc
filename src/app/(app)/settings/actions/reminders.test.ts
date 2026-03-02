import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const VALID_UUID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })
})

describe('updateReminderSchedule', () => {
  async function load() {
    const mod = await import('./reminders')
    return mod.updateReminderSchedule
  }

  it('returns error for invalid reminder ID', async () => {
    const fn = await load()
    const result = await fn('not-a-uuid', { is_active: true })
    expect(result.error).toBeTruthy()
  })

  it('returns error when user has no couple', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })
    const fn = await load()
    const result = await fn(VALID_UUID, { is_active: false })
    expect(result.error).toBe('You must be in a couple')
  })

  it('returns null error on success', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    const qb = mockSupabase._queryBuilder
    qb.eq = vi
      .fn()
      .mockReturnValueOnce(qb) // profile .eq('id', userId)
      .mockReturnValueOnce(qb) // update .eq('id', reminderId)
      .mockResolvedValueOnce({ error: null }) // update .eq('couple_id', coupleId)

    const fn = await load()
    const result = await fn(VALID_UUID, { is_active: true })
    expect(result.error).toBeNull()
  })

  it('returns error on DB failure', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    const qb = mockSupabase._queryBuilder
    qb.eq = vi
      .fn()
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(qb)
      .mockResolvedValueOnce({ error: { message: 'DB error', code: '42000' } })

    const fn = await load()
    const result = await fn(VALID_UUID, { is_active: false })
    expect(result.error).toBeTruthy()
  })
})

describe('toggleReminderActive', () => {
  it('delegates to updateReminderSchedule', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    const qb = mockSupabase._queryBuilder
    qb.eq = vi.fn().mockReturnValueOnce(qb).mockReturnValueOnce(qb).mockResolvedValueOnce({ error: null })

    const { toggleReminderActive } = await import('./reminders')
    const result = await toggleReminderActive(VALID_UUID, true)
    expect(result.error).toBeNull()
  })
})
