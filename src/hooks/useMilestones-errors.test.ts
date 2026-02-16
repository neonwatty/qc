import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockSupabase = createMockSupabaseClient()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

const { useMilestones } = await import('@/hooks/useMilestones')

function setupFetchMilestones(rows: Record<string, unknown>[] = []) {
  mockSupabase._queryBuilder.order.mockResolvedValueOnce({
    data: rows,
    error: null,
  })
}

describe('useMilestones – error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(mockSupabase._queryBuilder)) {
      if (key !== 'single' && key !== 'maybeSingle' && key !== 'order') {
        // eslint-disable-next-line security/detect-object-injection -- key is from Object.keys() of the same mock object
        mockSupabase._queryBuilder[key].mockReturnThis()
      }
    }
    mockSupabase._queryBuilder.single.mockResolvedValue({ data: null, error: null })
    mockSupabase._queryBuilder.order.mockResolvedValue({ data: [], error: null })
  })

  it('handles fetch errors', async () => {
    mockSupabase._queryBuilder.order.mockReset()
    mockSupabase._queryBuilder.order.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useMilestones('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.milestones).toHaveLength(0)
  })

  it('sets empty milestones when coupleId is null', async () => {
    const { result } = renderHook(() => useMilestones(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.milestones).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })

  it('handles create errors', async () => {
    setupFetchMilestones([])

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Insert failed' },
    })

    const { result } = renderHook(() => useMilestones('couple-abc'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await expect(
        result.current.createMilestone({
          title: 'Bad milestone',
          description: 'Will fail',
          category: 'growth',
          icon: '❌',
        }),
      ).rejects.toThrow()
    })

    expect(result.current.error).toBeTruthy()
  })
})
