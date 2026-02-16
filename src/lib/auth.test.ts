import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

const mockSupabase = createMockSupabaseClient()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabase),
}))

// Import after mocks are defined
const { requireAuth, getUserOrNull } = await import('@/lib/auth')

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user and supabase when authenticated', async () => {
    const fakeUser = { id: 'user-123', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: fakeUser },
      error: null,
    })

    const result = await requireAuth()

    expect(result.user).toEqual(fakeUser)
    expect(result.supabase).toBeDefined()
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('redirects to /login when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    await expect(requireAuth()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})

describe('getUserOrNull', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user when authenticated', async () => {
    const fakeUser = { id: 'user-456', email: 'partner@example.com' }
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: fakeUser },
      error: null,
    })

    const user = await getUserOrNull()

    expect(user).toEqual(fakeUser)
  })

  it('returns null when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const user = await getUserOrNull()

    expect(user).toBeNull()
  })
})
