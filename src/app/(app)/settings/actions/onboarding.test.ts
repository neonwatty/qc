import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }

let mockSupabase: ReturnType<typeof createMockSupabaseClient>
const mockAdminDelete = vi.fn()
const mockAdminUpdate = vi.fn()

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT:/onboarding')
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: mockAdminDelete,
      })),
      update: vi.fn(() => ({
        eq: mockAdminUpdate,
      })),
    })),
  })),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()
  mockAdminDelete.mockResolvedValue({ error: null })
  mockAdminUpdate.mockResolvedValue({ error: null })

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })
})

describe('redoOnboarding', () => {
  async function load() {
    const mod = await import('./onboarding')
    return mod.redoOnboarding
  }

  it('returns error when user has no couple', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })
    const fn = await load()
    const result = await fn()
    expect(result.error).toBe('You must be in a couple to redo onboarding')
  })

  it('redirects to onboarding on success', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
      error: null,
    })
    const fn = await load()
    await expect(fn()).rejects.toThrow('NEXT_REDIRECT:/onboarding')
  })

  it('returns error when admin delete fails', async () => {
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
      error: null,
    })
    mockAdminDelete.mockResolvedValueOnce({ error: { message: 'FK constraint', code: '23503' } })
    const fn = await load()
    const result = await fn()
    expect(result.error).toBeTruthy()
  })
})
