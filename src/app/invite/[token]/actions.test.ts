import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockToken = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
vi.mock('@/lib/couples', () => ({
  getInviteByToken: vi.fn(),
  acceptInvite: vi.fn(),
}))
class RedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT:${url}`)
  }
}

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new RedirectError(url)
  }),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })

  const { createClient } = await import('@/lib/supabase/server')
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase)
})

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

describe('validateInvite', () => {
  it('returns valid for a good token', async () => {
    const { validateInvite } = await import('./actions')
    const { getInviteByToken } = await import('@/lib/couples')

    ;(getInviteByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { invited_email: 'partner@example.com' },
      error: null,
    })

    const result = await validateInvite(mockToken)

    expect(result).toEqual({
      valid: true,
      inviterEmail: 'partner@example.com',
      error: null,
    })
    expect(getInviteByToken).toHaveBeenCalledWith(mockToken)
  })

  it('returns invalid for a non-uuid token', async () => {
    const { validateInvite } = await import('./actions')

    const result = await validateInvite('not-a-uuid')

    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('returns invalid when invite not found', async () => {
    const { validateInvite } = await import('./actions')
    const { getInviteByToken } = await import('@/lib/couples')

    ;(getInviteByToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: 'Not found',
    })

    const result = await validateInvite(mockToken)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('This invite is invalid or has expired.')
  })
})

describe('acceptInviteAction', () => {
  it('accepts an invite and redirects', async () => {
    const { acceptInviteAction } = await import('./actions')
    const { acceptInvite } = await import('@/lib/couples')
    const { redirect } = await import('next/navigation')

    // Profile has no couple_id
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })
    ;(acceptInvite as ReturnType<typeof vi.fn>).mockResolvedValue({ error: null })

    const fd = makeFormData({ token: mockToken })
    await expect(acceptInviteAction({ error: null }, fd)).rejects.toThrow('NEXT_REDIRECT:/dashboard')

    expect(acceptInvite).toHaveBeenCalledWith(mockToken)
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('returns error when user is already in a couple', async () => {
    const { acceptInviteAction } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: 'existing-couple' },
      error: null,
    })

    const fd = makeFormData({ token: mockToken })
    const result = await acceptInviteAction({ error: null }, fd)

    expect(result.error).toBe('You are already in a couple. Leave your current couple first.')
  })

  it('returns error for invalid token', async () => {
    const { acceptInviteAction } = await import('./actions')

    const fd = makeFormData({ token: 'not-a-uuid' })
    const result = await acceptInviteAction({ error: null }, fd)

    expect(result.error).toBeTruthy()
  })

  it('returns error when acceptInvite fails', async () => {
    const { acceptInviteAction } = await import('./actions')
    const { acceptInvite } = await import('@/lib/couples')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })
    ;(acceptInvite as ReturnType<typeof vi.fn>).mockResolvedValue({ error: 'Accept failed' })

    const fd = makeFormData({ token: mockToken })
    const result = await acceptInviteAction({ error: null }, fd)

    expect(result.error).toBe('Accept failed')
  })
})
