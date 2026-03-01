import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })

const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
        maybeSingle: mockMaybeSingle,
      }),
    }),
  }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
  },
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

const { SessionSettingsProvider, useSessionSettings } = await import('./SessionSettingsContext')

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return <SessionSettingsProvider coupleId="couple-1">{children}</SessionSettingsProvider>
}

function resetMockChain(): void {
  mockMaybeSingle.mockResolvedValue({ data: null, error: null })
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle }),
        maybeSingle: mockMaybeSingle,
      }),
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetMockChain()
})

describe('useSessionSettings', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useSessionSettings())).toThrow(
      'useSessionSettings must be used within a SessionSettingsProvider',
    )
  })

  it('returns 3 templates', () => {
    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    expect(result.current.templates).toHaveLength(3)
    expect(result.current.templates.map((t) => t.type)).toEqual(['quick', 'standard', 'deep-dive'])
  })

  it('returns default settings via getActiveSettings when no DB settings', async () => {
    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings).not.toBeNull()
    })
    const settings = result.current.getActiveSettings()
    expect(settings.sessionDuration).toBe(10)
    expect(settings.coupleId).toBe('couple-1')
  })

  it('loads settings from DB when available', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'ss-1',
        couple_id: 'couple-1',
        session_duration: 20,
        timeouts_per_partner: 2,
        timeout_duration: 3,
        turn_based_mode: true,
        turn_duration: 120,
        allow_extensions: true,
        warm_up_questions: true,
        cool_down_time: 5,
        pause_notifications: false,
        auto_save_drafts: true,
        version: 3,
        agreed_by: ['user-1', 'user-2'],
      },
      error: null,
    })

    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings?.sessionDuration).toBe(20)
    })
    expect(result.current.currentSettings?.warmUpQuestions).toBe(true)
  })

  it('falls back to defaults on load error', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings).not.toBeNull()
    })
    expect(result.current.currentSettings?.sessionDuration).toBe(10)
  })

  it('pendingProposal is null initially', async () => {
    const { result } = renderHook(() => useSessionSettings(), { wrapper })
    await waitFor(() => {
      expect(result.current.currentSettings).not.toBeNull()
    })
    expect(result.current.pendingProposal).toBeNull()
  })
})
