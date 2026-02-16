import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DbLoveLanguage, DbLoveAction } from '@/types'

import { mapDbLanguage, mapDbAction, fetchLanguages, fetchActions } from '@/lib/love-language-operations'
import { buildMockClient } from '@/lib/__test-helpers__/mock-client'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as ReturnType<typeof vi.fn>

// --- Fixtures ---

function makeDbLanguage(overrides: Partial<DbLoveLanguage> = {}): DbLoveLanguage {
  return {
    id: 'lang-1',
    couple_id: 'couple-1',
    user_id: 'user-1',
    title: 'Words of Affirmation',
    description: 'Verbal compliments',
    category: 'words',
    privacy: 'shared',
    importance: 'high',
    examples: ['Thank you', 'I love you'],
    tags: ['daily', 'verbal'],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
    ...overrides,
  }
}

function makeDbAction(overrides: Partial<DbLoveAction> = {}): DbLoveAction {
  return {
    id: 'action-1',
    couple_id: 'couple-1',
    linked_language_id: 'lang-1',
    title: 'Write a love note',
    description: 'Leave a sticky note on the mirror',
    status: 'planned',
    frequency: 'weekly',
    difficulty: 'easy',
    completed_count: 3,
    last_completed_at: '2025-01-10T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

// --- Tests ---

describe('mapDbLanguage', () => {
  it('maps all fields correctly', () => {
    const row = makeDbLanguage()
    const result = mapDbLanguage(row)

    expect(result).toEqual({
      id: 'lang-1',
      coupleId: 'couple-1',
      userId: 'user-1',
      title: 'Words of Affirmation',
      description: 'Verbal compliments',
      category: 'words',
      privacy: 'shared',
      importance: 'high',
      examples: ['Thank you', 'I love you'],
      tags: ['daily', 'verbal'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    })
  })

  it('defaults examples to empty array when null', () => {
    const row = makeDbLanguage({ examples: null as unknown as string[] })
    const result = mapDbLanguage(row)
    expect(result.examples).toEqual([])
  })

  it('defaults tags to empty array when null', () => {
    const row = makeDbLanguage({ tags: null as unknown as string[] })
    const result = mapDbLanguage(row)
    expect(result.tags).toEqual([])
  })
})

describe('mapDbAction', () => {
  it('maps all fields correctly', () => {
    const row = makeDbAction()
    const result = mapDbAction(row)

    expect(result).toEqual({
      id: 'action-1',
      coupleId: 'couple-1',
      linkedLanguageId: 'lang-1',
      title: 'Write a love note',
      description: 'Leave a sticky note on the mirror',
      status: 'planned',
      frequency: 'weekly',
      difficulty: 'easy',
      completedCount: 3,
      lastCompletedAt: '2025-01-10T00:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
    })
  })

  it('handles null linked_language_id', () => {
    const row = makeDbAction({ linked_language_id: null })
    const result = mapDbAction(row)
    expect(result.linkedLanguageId).toBeNull()
  })

  it('handles null last_completed_at', () => {
    const row = makeDbAction({ last_completed_at: null })
    const result = mapDbAction(row)
    expect(result.lastCompletedAt).toBeNull()
  })
})

describe('fetchLanguages', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('calls from/select/eq/or/order and returns mapped results', async () => {
    const dbRow = makeDbLanguage()
    mock.result.data = [dbRow]
    mock.result.error = null

    const result = await fetchLanguages('couple-1', 'user-1')

    expect(mock.client.from).toHaveBeenCalledWith('love_languages')
    expect(mock.client.select).toHaveBeenCalledWith('*')
    expect(mock.client.eq).toHaveBeenCalledWith('couple_id', 'couple-1')
    expect(mock.client.or).toHaveBeenCalledWith('user_id.eq.user-1,privacy.eq.shared')
    expect(mock.client.order).toHaveBeenCalledWith('created_at', { ascending: false })

    expect(result).toHaveLength(1)
    expect(result[0].coupleId).toBe('couple-1')
    expect(result[0].userId).toBe('user-1')
  })

  it('throws on Supabase error', async () => {
    mock.result.data = null
    mock.result.error = { message: 'fetch failed' }

    await expect(fetchLanguages('couple-1', 'user-1')).rejects.toEqual({ message: 'fetch failed' })
  })
})

describe('fetchActions', () => {
  let mock: ReturnType<typeof buildMockClient>

  beforeEach(() => {
    vi.clearAllMocks()
    mock = buildMockClient()
    mockCreateClient.mockReturnValue(mock.client)
  })

  it('calls from/select/eq/order and returns mapped results', async () => {
    const dbRow = makeDbAction()
    mock.result.data = [dbRow]
    mock.result.error = null

    const result = await fetchActions('couple-1')

    expect(mock.client.from).toHaveBeenCalledWith('love_actions')
    expect(mock.client.select).toHaveBeenCalledWith('*')
    expect(mock.client.eq).toHaveBeenCalledWith('couple_id', 'couple-1')
    expect(mock.client.order).toHaveBeenCalledWith('created_at', { ascending: false })

    expect(result).toHaveLength(1)
    expect(result[0].coupleId).toBe('couple-1')
  })

  it('throws on Supabase error', async () => {
    mock.result.data = null
    mock.result.error = { message: 'fetch actions failed' }

    await expect(fetchActions('couple-1')).rejects.toEqual({ message: 'fetch actions failed' })
  })
})
