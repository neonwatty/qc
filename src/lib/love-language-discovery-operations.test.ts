import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { DbLoveLanguageDiscovery } from '@/types'

const mockRow: DbLoveLanguageDiscovery = {
  id: 'disc-1',
  couple_id: 'couple-1',
  user_id: 'user-1',
  check_in_id: 'ci-1',
  discovery: 'They love acts of service',
  converted_to_language_id: null,
  created_at: '2025-06-01T00:00:00Z',
}

// Chainable mock — every method returns the chain; terminal methods resolve
function createChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['from', 'select', 'insert', 'update', 'delete', 'eq', 'order', 'single']
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  return chain
}

const chain = createChain()
const mockCreateClient = vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue(chain) })

vi.mock('@/lib/supabase/client', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}))

beforeEach(() => {
  vi.clearAllMocks()
  // Re-wire chain methods to be chainable after clearAllMocks
  const methods = ['from', 'select', 'insert', 'update', 'delete', 'eq', 'order', 'single']
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  mockCreateClient.mockReturnValue({ from: vi.fn().mockReturnValue(chain) })
})

describe('mapDbDiscovery', () => {
  it('maps DB row to domain object', async () => {
    const { mapDbDiscovery } = await import('./love-language-discovery-operations')
    const result = mapDbDiscovery(mockRow)
    expect(result).toEqual({
      id: 'disc-1',
      coupleId: 'couple-1',
      userId: 'user-1',
      checkInId: 'ci-1',
      discovery: 'They love acts of service',
      convertedToLanguageId: null,
      createdAt: '2025-06-01T00:00:00Z',
    })
  })
})

describe('fetchDiscoveries', () => {
  it('returns mapped discoveries', async () => {
    chain['order'] = vi.fn().mockResolvedValue({ data: [mockRow], error: null })
    const { fetchDiscoveries } = await import('./love-language-discovery-operations')
    const result = await fetchDiscoveries('couple-1', 'user-1')
    expect(result).toHaveLength(1)
    expect(result[0].coupleId).toBe('couple-1')
  })

  it('throws on error', async () => {
    chain['order'] = vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch failed' } })
    const { fetchDiscoveries } = await import('./love-language-discovery-operations')
    await expect(fetchDiscoveries('couple-1', 'user-1')).rejects.toThrow('Fetch failed')
  })
})

describe('insertDiscovery', () => {
  it('inserts and returns mapped discovery', async () => {
    chain['single'] = vi.fn().mockResolvedValue({ data: mockRow, error: null })
    const { insertDiscovery } = await import('./love-language-discovery-operations')
    const result = await insertDiscovery('couple-1', 'user-1', { discovery: 'New insight' })
    expect(result.id).toBe('disc-1')
  })

  it('throws on error', async () => {
    chain['single'] = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
    const { insertDiscovery } = await import('./love-language-discovery-operations')
    await expect(insertDiscovery('c', 'u', { discovery: 'x' })).rejects.toThrow('Insert failed')
  })
})

describe('deleteDiscoveryDb', () => {
  it('deletes without error', async () => {
    chain['eq'] = vi.fn().mockResolvedValue({ error: null })
    const { deleteDiscoveryDb } = await import('./love-language-discovery-operations')
    await expect(deleteDiscoveryDb('disc-1')).resolves.toBeUndefined()
  })

  it('throws on error', async () => {
    chain['eq'] = vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
    const { deleteDiscoveryDb } = await import('./love-language-discovery-operations')
    await expect(deleteDiscoveryDb('disc-1')).rejects.toThrow('Delete failed')
  })
})

describe('convertDiscoveryToLanguage', () => {
  it('updates and returns mapped discovery', async () => {
    const converted = { ...mockRow, converted_to_language_id: 'lang-1' }
    chain['single'] = vi.fn().mockResolvedValue({ data: converted, error: null })
    const { convertDiscoveryToLanguage } = await import('./love-language-discovery-operations')
    const result = await convertDiscoveryToLanguage('disc-1', 'lang-1')
    expect(result.convertedToLanguageId).toBe('lang-1')
  })

  it('throws on error', async () => {
    chain['single'] = vi.fn().mockResolvedValue({ data: null, error: { message: 'Convert failed' } })
    const { convertDiscoveryToLanguage } = await import('./love-language-discovery-operations')
    await expect(convertDiscoveryToLanguage('disc-1', 'lang-1')).rejects.toThrow('Convert failed')
  })
})
