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

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    session_duration: '15',
    timeouts_per_partner: '2',
    timeout_duration: '3',
    turn_based_mode: 'true',
    turn_duration: '120',
    allow_extensions: 'true',
    warm_up_questions: 'true',
    cool_down_time: '5',
    pause_notifications: 'true',
    auto_save_drafts: 'true',
  }
  const fd = new FormData()
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) fd.append(k, v)
  return fd
}

describe('updateSessionSettings', () => {
  it('validates session_duration min', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const fd = makeFormData({ session_duration: '2' })
    const result = await updateSessionSettings({}, fd)

    expect(result.error).toBeTruthy()
  })

  it('validates session_duration max', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const fd = makeFormData({ session_duration: '100' })
    const result = await updateSessionSettings({}, fd)

    expect(result.error).toBeTruthy()
  })

  it('validates turn_duration bounds', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const fd = makeFormData({ turn_duration: '10' })
    const result = await updateSessionSettings({}, fd)

    expect(result.error).toBeTruthy()
  })

  it('handles boolean fields via getAll pattern', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')

    // Profile lookup
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    // All booleans are false when not set to 'true'
    const fd = makeFormData({
      turn_based_mode: 'false',
      allow_extensions: 'false',
      warm_up_questions: 'false',
      pause_notifications: 'false',
      auto_save_drafts: 'false',
    })
    const result = await updateSessionSettings({}, fd)

    expect(result).toEqual({ success: true })
  })

  it('returns error when profile has no couple_id', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData()
    const result = await updateSessionSettings({}, fd)

    expect(result.error).toBe('You must be in a couple to update session settings')
  })

  it('returns error on update failure', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce({ data: null, error: { message: 'DB error' } })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const fd = makeFormData()
    const result = await updateSessionSettings({}, fd)

    expect(result.error).toBe('Something went wrong. Please try again.')
  })

  it('calls revalidatePath on success', async () => {
    const { updateSessionSettings } = await import('./actions/proposals')
    const { revalidatePath } = await import('next/cache')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const fd = makeFormData()
    await updateSessionSettings({}, fd)

    expect(revalidatePath).toHaveBeenCalledWith('/settings')
  })
})
