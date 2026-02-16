import { describe, it, expect, vi, beforeEach } from 'vitest'

import { updateCheckInStatus, insertNote, insertActionItem, toggleActionItemDb } from '@/lib/checkin-operations'
import { buildMockClient } from '@/lib/__test-helpers__/mock-client'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

// --- Tests ---

describe('updateCheckInStatus', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('verifies update with completed_at', async () => {
    mock.result.error = null

    await updateCheckInStatus('ci-1', 'completed')

    expect(mock.client.from).toHaveBeenCalledWith('check_ins')
    expect(mock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
      }),
    )

    const updateArg = mock.client.update.mock.calls[0][0]
    expect(updateArg.completed_at).toBeDefined()
    expect(typeof updateArg.completed_at).toBe('string')

    expect(mock.client.eq).toHaveBeenCalledWith('id', 'ci-1')
  })

  it('passes abandoned status', async () => {
    mock.result.error = null

    await updateCheckInStatus('ci-1', 'abandoned')

    const updateArg = mock.client.update.mock.calls[0][0]
    expect(updateArg.status).toBe('abandoned')
  })
})

describe('insertNote', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('verifies insert params', async () => {
    mock.result.data = { id: 'note-1' }
    mock.result.error = null

    await insertNote({
      coupleId: 'couple-1',
      authorId: 'user-1',
      checkInId: 'ci-1',
      content: 'We should talk more',
      privacy: 'shared',
      tags: ['communication'],
      categoryId: null,
    })

    expect(mock.client.from).toHaveBeenCalledWith('notes')
    expect(mock.client.insert).toHaveBeenCalledWith({
      couple_id: 'couple-1',
      author_id: 'user-1',
      check_in_id: 'ci-1',
      content: 'We should talk more',
      privacy: 'shared',
      tags: ['communication'],
      category_id: null,
    })
    expect(mock.client.select).toHaveBeenCalled()
    expect(mock.client.single).toHaveBeenCalled()
  })
})

describe('insertActionItem', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('verifies insert params with completed: false', async () => {
    mock.result.error = null

    await insertActionItem({
      coupleId: 'couple-1',
      checkInId: 'ci-1',
      title: 'Plan date night',
      description: 'Choose a restaurant',
      assignedTo: 'user-1',
      dueDate: '2025-02-14',
    })

    expect(mock.client.from).toHaveBeenCalledWith('action_items')
    expect(mock.client.insert).toHaveBeenCalledWith({
      couple_id: 'couple-1',
      check_in_id: 'ci-1',
      title: 'Plan date night',
      description: 'Choose a restaurant',
      assigned_to: 'user-1',
      due_date: '2025-02-14',
      completed: false,
    })
  })

  it('handles null optional fields', async () => {
    mock.result.error = null

    await insertActionItem({
      coupleId: 'couple-1',
      checkInId: null,
      title: 'Generic task',
      description: null,
      assignedTo: null,
      dueDate: null,
    })

    expect(mock.client.insert).toHaveBeenCalledWith({
      couple_id: 'couple-1',
      check_in_id: null,
      title: 'Generic task',
      description: null,
      assigned_to: null,
      due_date: null,
      completed: false,
    })
  })
})

describe('toggleActionItemDb', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('when currentCompleted is false, updates to completed=true with timestamp', async () => {
    mock.result.error = null

    await toggleActionItemDb('ai-1', false)

    expect(mock.client.from).toHaveBeenCalledWith('action_items')
    expect(mock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        completed: true,
      }),
    )

    const updateArg = mock.client.update.mock.calls[0][0]
    expect(updateArg.completed_at).toBeDefined()
    expect(typeof updateArg.completed_at).toBe('string')

    expect(mock.client.eq).toHaveBeenCalledWith('id', 'ai-1')
  })

  it('when currentCompleted is true, updates to completed=false with null completedAt', async () => {
    mock.result.error = null

    await toggleActionItemDb('ai-1', true)

    expect(mock.client.from).toHaveBeenCalledWith('action_items')
    expect(mock.client.update).toHaveBeenCalledWith({
      completed: false,
      completed_at: null,
    })
    expect(mock.client.eq).toHaveBeenCalledWith('id', 'ai-1')
  })
})
