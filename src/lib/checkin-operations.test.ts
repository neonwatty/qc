import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DbActionItem } from '@/types'

import { mapDbActionItem, fetchActiveCheckIn, insertCheckIn } from '@/lib/checkin-operations'
import { buildMockClient } from '@/lib/__test-helpers__/mock-client'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

// --- Fixtures ---

function makeDbActionItem(overrides: Partial<DbActionItem> = {}): DbActionItem {
  return {
    id: 'ai-1',
    couple_id: 'couple-1',
    check_in_id: 'checkin-1',
    title: 'Plan date night',
    description: 'Choose a restaurant',
    assigned_to: 'user-1',
    due_date: '2025-02-14',
    completed: false,
    completed_at: null,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// --- Tests ---

describe('mapDbActionItem', () => {
  it('maps all fields correctly', () => {
    const item = makeDbActionItem()
    const result = mapDbActionItem(item)

    expect(result).toEqual({
      id: 'ai-1',
      coupleId: 'couple-1',
      checkInId: 'checkin-1',
      title: 'Plan date night',
      description: 'Choose a restaurant',
      assignedTo: 'user-1',
      dueDate: '2025-02-14',
      completed: false,
      completedAt: null,
      createdAt: '2025-01-01T00:00:00Z',
    })
  })

  it('handles null check_in_id', () => {
    const item = makeDbActionItem({ check_in_id: null })
    const result = mapDbActionItem(item)
    expect(result.checkInId).toBeNull()
  })

  it('handles null description', () => {
    const item = makeDbActionItem({ description: null })
    const result = mapDbActionItem(item)
    expect(result.description).toBeNull()
  })

  it('handles null assigned_to and due_date', () => {
    const item = makeDbActionItem({ assigned_to: null, due_date: null })
    const result = mapDbActionItem(item)
    expect(result.assignedTo).toBeNull()
    expect(result.dueDate).toBeNull()
  })

  it('handles completed item with completed_at timestamp', () => {
    const item = makeDbActionItem({ completed: true, completed_at: '2025-01-15T12:00:00Z' })
    const result = mapDbActionItem(item)
    expect(result.completed).toBe(true)
    expect(result.completedAt).toBe('2025-01-15T12:00:00Z')
  })
})

describe('fetchActiveCheckIn', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('verifies correct chain of calls', async () => {
    mock.result.data = null
    mock.result.error = null

    await fetchActiveCheckIn('couple-1')

    expect(mock.client.from).toHaveBeenCalledWith('check_ins')
    expect(mock.client.select).toHaveBeenCalledWith('*')
    expect(mock.client.eq).toHaveBeenCalledWith('couple_id', 'couple-1')
    expect(mock.client.eq).toHaveBeenCalledWith('status', 'in-progress')
    expect(mock.client.order).toHaveBeenCalledWith('started_at', { ascending: false })
    expect(mock.client.limit).toHaveBeenCalledWith(1)
    expect(mock.client.maybeSingle).toHaveBeenCalled()
  })
})

describe('insertCheckIn', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('verifies insert params', async () => {
    mock.result.data = { id: 'ci-1' }
    mock.result.error = null

    await insertCheckIn('ci-1', 'couple-1', '2025-01-01T10:00:00Z', ['communication', 'intimacy'])

    expect(mock.client.from).toHaveBeenCalledWith('check_ins')
    expect(mock.client.insert).toHaveBeenCalledWith({
      id: 'ci-1',
      couple_id: 'couple-1',
      started_at: '2025-01-01T10:00:00Z',
      status: 'in-progress',
      categories: ['communication', 'intimacy'],
    })
    expect(mock.client.select).toHaveBeenCalled()
    expect(mock.client.single).toHaveBeenCalled()
  })
})
