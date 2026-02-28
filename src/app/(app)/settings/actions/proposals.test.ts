import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({ requireAuth: vi.fn() }))
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
  it('returns error when no couple', async () => {
    const { updateSessionSettings } = await import('./proposals')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const result = await updateSessionSettings({}, makeFormData())

    expect(result.error).toBe('You must be in a couple to update session settings')
  })

  it('returns success with valid formData', async () => {
    const { updateSessionSettings } = await import('./proposals')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const result = await updateSessionSettings({}, makeFormData())

    expect(result).toEqual({ success: true })
  })

  it('returns validation error for out-of-range values', async () => {
    const { updateSessionSettings } = await import('./proposals')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const result = await updateSessionSettings({}, makeFormData({ session_duration: '999' }))

    expect(result.error).toBeTruthy()
  })

  it('returns db error when supabase fails', async () => {
    const { updateSessionSettings } = await import('./proposals')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce({ data: null, error: { message: 'Update failed' } })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const result = await updateSessionSettings({}, makeFormData())

    expect(result.error).toBe('Update failed')
  })
})
