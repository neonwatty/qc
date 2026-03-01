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

describe('updateCategoryPrompts', () => {
  async function load() {
    const mod = await import('./prompts')
    return mod.updateCategoryPrompts
  }

  it('returns error for invalid category ID', async () => {
    const fn = await load()
    const result = await fn('not-a-uuid', ['Hello?'])
    expect(result.error).toBeTruthy()
  })

  it('returns error for too many prompts', async () => {
    const fn = await load()
    const tooMany = Array.from({ length: 11 }, (_, i) => `Prompt ${i}`)
    const result = await fn(VALID_UUID, tooMany)
    expect(result.error).toBeTruthy()
  })

  it('returns error for empty prompt string', async () => {
    const fn = await load()
    const result = await fn(VALID_UUID, [''])
    expect(result.error).toBeTruthy()
  })

  it('returns error when user has no couple', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })
    const fn = await load()
    const result = await fn(VALID_UUID, ['Good prompt'])
    expect(result.error).toBe('You must be in a couple to manage prompts')
  })

  it('returns null error on success', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    // eq is called 3 times: profile .eq('id',...), update .eq('id',...), update .eq('couple_id',...)
    const qb = mockSupabase._queryBuilder
    qb.eq = vi
      .fn()
      .mockReturnValueOnce(qb) // profile .eq('id', userId)
      .mockReturnValueOnce(qb) // update .eq('id', categoryId)
      .mockResolvedValueOnce({ error: null }) // update .eq('couple_id', coupleId)

    const fn = await load()
    const result = await fn(VALID_UUID, ['How are you?'])
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
    const result = await fn(VALID_UUID, ['How are you?'])
    expect(result.error).toBeTruthy()
  })

  it('allows empty prompts array', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    const qb = mockSupabase._queryBuilder
    qb.eq = vi.fn().mockReturnValueOnce(qb).mockReturnValueOnce(qb).mockResolvedValueOnce({ error: null })

    const fn = await load()
    const result = await fn(VALID_UUID, [])
    expect(result.error).toBeNull()
  })
})
