import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, cleanup } from '@testing-library/react'

type ChannelCallback = (payload: Record<string, unknown>) => void

const mockSubscribe = vi.fn().mockReturnThis()
const mockRemoveChannel = vi.fn()
let capturedCallback: ChannelCallback | null = null
let capturedFilter: Record<string, unknown> | null = null

const mockChannel = {
  on: vi.fn().mockImplementation((_event: string, filter: Record<string, unknown>, cb: ChannelCallback) => {
    capturedFilter = filter
    capturedCallback = cb
    return mockChannel
  }),
  subscribe: mockSubscribe,
}

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: mockRemoveChannel,
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

const { useRealtimeCouple } = await import('@/hooks/useRealtimeCouple')

describe('useRealtimeCouple', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedCallback = null
    capturedFilter = null
    cleanup()
  })

  it('subscribes to postgres_changes with correct couple_id filter', () => {
    renderHook(() =>
      useRealtimeCouple({
        table: 'notes',
        coupleId: 'couple-abc',
      }),
    )

    expect(mockSupabase.channel).toHaveBeenCalledWith('notes:couple:couple-abc')
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: 'couple_id=eq.couple-abc',
      },
      expect.any(Function),
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('calls onInsert callback on INSERT events', () => {
    const onInsert = vi.fn()

    renderHook(() =>
      useRealtimeCouple({
        table: 'notes',
        coupleId: 'couple-abc',
        onInsert,
      }),
    )

    capturedCallback!({
      eventType: 'INSERT',
      new: { id: 'note-1', title: 'New note' },
      old: {},
    })

    expect(onInsert).toHaveBeenCalledWith({ id: 'note-1', title: 'New note' })
  })

  it('calls onUpdate callback on UPDATE events', () => {
    const onUpdate = vi.fn()

    renderHook(() =>
      useRealtimeCouple({
        table: 'check_ins',
        coupleId: 'couple-abc',
        onUpdate,
      }),
    )

    capturedCallback!({
      eventType: 'UPDATE',
      new: { id: 'ci-1', status: 'completed' },
      old: { id: 'ci-1', status: 'in-progress' },
    })

    expect(onUpdate).toHaveBeenCalledWith({ id: 'ci-1', status: 'completed' })
  })

  it('calls onDelete callback on DELETE events', () => {
    const onDelete = vi.fn()

    renderHook(() =>
      useRealtimeCouple({
        table: 'action_items',
        coupleId: 'couple-abc',
        onDelete,
      }),
    )

    capturedCallback!({
      eventType: 'DELETE',
      new: {},
      old: { id: 'ai-1', title: 'Deleted item' },
    })

    expect(onDelete).toHaveBeenCalledWith({ id: 'ai-1', title: 'Deleted item' })
  })

  it('unsubscribes on cleanup', () => {
    const { unmount } = renderHook(() =>
      useRealtimeCouple({
        table: 'notes',
        coupleId: 'couple-abc',
      }),
    )

    unmount()

    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannel)
  })

  it('does not subscribe when coupleId is null', () => {
    renderHook(() =>
      useRealtimeCouple({
        table: 'notes',
        coupleId: null,
      }),
    )

    expect(mockSupabase.channel).not.toHaveBeenCalled()
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('uses correct filter format', () => {
    renderHook(() =>
      useRealtimeCouple({
        table: 'requests',
        coupleId: 'couple-xyz-789',
      }),
    )

    expect(capturedFilter).toEqual({
      event: '*',
      schema: 'public',
      table: 'requests',
      filter: 'couple_id=eq.couple-xyz-789',
    })
  })
})
