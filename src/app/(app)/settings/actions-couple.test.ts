import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('@/lib/couples', () => ({
  leaveCouple: vi.fn(),
  resendInvite: vi.fn(),
}))
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))
vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
  shouldSendEmail: vi.fn(),
}))
vi.mock('@/lib/data-export', () => ({
  exportUserData: vi.fn(),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })
})

describe('updateCoupleSettings', () => {
  it('updates via RPC call', async () => {
    const { updateCoupleSettings } = await import('./actions')

    // Profile lookup
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi.fn().mockReturnValueOnce(mockSupabase._queryBuilder)
    mockSupabase.rpc.mockResolvedValueOnce({ data: null, error: null })

    const result = await updateCoupleSettings('enable_reminders', true)

    expect(result).toEqual({})
    expect(mockSupabase.rpc).toHaveBeenCalledWith('update_couple_setting', {
      p_couple_id: mockCoupleId,
      p_key: 'enable_reminders',
      p_value: true,
    })
  })

  it('returns error when no couple', async () => {
    const { updateCoupleSettings } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const result = await updateCoupleSettings('enable_reminders', true)

    expect(result.error).toBe('No couple found')
  })

  it('returns error on RPC failure', async () => {
    const { updateCoupleSettings } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi.fn().mockReturnValueOnce(mockSupabase._queryBuilder)
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'RPC failed' },
    })

    const result = await updateCoupleSettings('enable_reminders', true)

    expect(result.error).toBe('RPC failed')
  })
})

describe('exportUserData', () => {
  it('exports successfully', async () => {
    const { exportUserData } = await import('./actions')
    const dataExport = await import('@/lib/data-export')

    const mockExportData = {
      version: '1.0.0',
      exportedAt: '2025-01-01T00:00:00.000Z',
      profile: { id: mockUser.id, display_name: 'Test', email: 'test@test.com' },
      couple: null,
      notes: [],
      checkIns: [],
      actionItems: [],
      milestones: [],
      reminders: [],
      requests: [],
      loveLanguages: [],
      loveActions: [],
    }

    ;(dataExport.exportUserData as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockExportData,
      error: null,
    })

    const result = await exportUserData()

    expect(result.data).toEqual(mockExportData)
    expect(result.error).toBeNull()
    expect(dataExport.exportUserData).toHaveBeenCalledWith(mockSupabase, mockUser.id)
  })

  it('returns error when export fails', async () => {
    const { exportUserData } = await import('./actions')
    const dataExport = await import('@/lib/data-export')

    ;(dataExport.exportUserData as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: 'Export failed',
    })

    const result = await exportUserData()

    expect(result.data).toBeNull()
    expect(result.error).toBe('Export failed')
  })
})
