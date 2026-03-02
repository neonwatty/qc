import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

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

describe('updatePersonalization', () => {
  async function load() {
    const mod = await import('./personalization')
    return mod.updatePersonalization
  }

  it('returns error when user has no couple', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({ data: { couple_id: null }, error: null })

    const fn = await load()
    const result = await fn({ primaryColor: 'blue' })
    expect(result.error).toBe('No couple found')
  })

  it('returns null error on success', async () => {
    mockSupabase._queryBuilder.single
      .mockResolvedValueOnce({ data: { couple_id: mockCoupleId }, error: null })
      .mockResolvedValueOnce({ data: { settings: {} }, error: null })

    const qb = mockSupabase._queryBuilder
    qb.eq = vi.fn().mockReturnValueOnce(qb).mockReturnValueOnce(qb).mockResolvedValueOnce({ error: null })

    const fn = await load()
    const result = await fn({ primaryColor: 'blue', fontSize: 'large' })
    expect(result.error).toBeNull()
  })

  it('returns error for invalid fontSize', async () => {
    const fn = await load()
    const result = await fn({ fontSize: 'gigantic' })
    expect(result.error).toBeTruthy()
  })

  it('returns error on DB failure', async () => {
    mockSupabase._queryBuilder.single
      .mockResolvedValueOnce({ data: { couple_id: mockCoupleId }, error: null })
      .mockResolvedValueOnce({ data: { settings: {} }, error: null })

    const qb = mockSupabase._queryBuilder
    qb.eq = vi
      .fn()
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(qb)
      .mockResolvedValueOnce({ error: { message: 'DB error', code: '42000' } })

    const fn = await load()
    const result = await fn({ highContrast: true })
    expect(result.error).toBeTruthy()
  })
})
