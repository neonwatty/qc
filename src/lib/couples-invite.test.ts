import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'user-1', email: 'test@example.com' }
const mockInvite = {
  id: 'invite-1',
  couple_id: 'couple-1',
  invited_by: 'user-1',
  invited_email: 'partner@example.com',
  token: 'mock-token',
  status: 'pending',
  created_at: '2025-01-01T00:00:00Z',
  expires_at: '2025-01-08T00:00:00Z',
}

let mockSupabase: ReturnType<typeof createMockSupabaseClient>
let mockAdmin: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', { randomUUID: () => 'mock-uuid-token' })

async function getServerMock() {
  const mod = await import('@/lib/supabase/server')
  return mod.createClient as ReturnType<typeof vi.fn>
}

async function getAdminMock() {
  const mod = await import('@/lib/supabase/admin')
  return mod.createAdminClient as ReturnType<typeof vi.fn>
}

function setupAuthenticatedUser() {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  })
}

function setupUnauthenticatedUser() {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
}

beforeEach(async () => {
  vi.clearAllMocks()

  mockSupabase = createMockSupabaseClient()
  mockAdmin = createMockSupabaseClient()

  const createClientMock = await getServerMock()
  createClientMock.mockResolvedValue(mockSupabase)

  const createAdminClientMock = await getAdminMock()
  createAdminClientMock.mockReturnValue(mockAdmin)
})

describe('joinCouple', () => {
  it('updates the profile with the couple_id', async () => {
    const { joinCouple } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.eq.mockResolvedValueOnce({ data: null, error: null })

    const result = await joinCouple('couple-1')

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase._queryBuilder.update).toHaveBeenCalledWith({ couple_id: 'couple-1' })
    expect(mockSupabase._queryBuilder.eq).toHaveBeenCalledWith('id', 'user-1')
    expect(result).toEqual({ error: null })
  })

  it('returns error when not authenticated', async () => {
    const { joinCouple } = await import('@/lib/couples')
    setupUnauthenticatedUser()

    const result = await joinCouple('couple-1')

    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when profile update fails', async () => {
    const { joinCouple } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.eq.mockResolvedValueOnce({
      data: null,
      error: { message: 'Update failed' },
    })

    const result = await joinCouple('couple-1')

    expect(result).toEqual({ error: 'Update failed' })
  })
})

describe('leaveCouple', () => {
  it('sets couple_id to null on the profile', async () => {
    const { leaveCouple } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.eq.mockResolvedValueOnce({ data: null, error: null })

    const result = await leaveCouple()

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase._queryBuilder.update).toHaveBeenCalledWith({ couple_id: null })
    expect(result).toEqual({ error: null })
  })

  it('returns error when not authenticated', async () => {
    const { leaveCouple } = await import('@/lib/couples')
    setupUnauthenticatedUser()

    const result = await leaveCouple()

    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when profile update fails', async () => {
    const { leaveCouple } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.eq.mockResolvedValueOnce({
      data: null,
      error: { message: 'Update failed' },
    })

    const result = await leaveCouple()

    expect(result).toEqual({ error: 'Update failed' })
  })
})

describe('createInvite', () => {
  it('creates an invite with the generated token', async () => {
    const { createInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.single
      .mockResolvedValueOnce({ data: { couple_id: 'couple-1' }, error: null })
      .mockResolvedValueOnce({ data: mockInvite, error: null })

    const result = await createInvite('partner@example.com')

    expect(mockSupabase.from).toHaveBeenCalledWith('couple_invites')
    expect(mockSupabase._queryBuilder.insert).toHaveBeenCalledWith({
      couple_id: 'couple-1',
      invited_by: 'user-1',
      invited_email: 'partner@example.com',
      token: 'mock-uuid-token',
    })
    expect(result).toEqual({ data: mockInvite, error: null })
  })

  it('returns error when not authenticated', async () => {
    const { createInvite } = await import('@/lib/couples')
    setupUnauthenticatedUser()

    const result = await createInvite('partner@example.com')

    expect(result).toEqual({ data: null, error: 'Not authenticated' })
  })

  it('returns error when user has no couple', async () => {
    const { createInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const result = await createInvite('partner@example.com')

    expect(result).toEqual({ data: null, error: 'Not in a couple' })
  })

  it('returns error when invite insert fails', async () => {
    const { createInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockSupabase._queryBuilder.single
      .mockResolvedValueOnce({ data: { couple_id: 'couple-1' }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Invite insert failed' } })

    const result = await createInvite('partner@example.com')

    expect(result).toEqual({ data: null, error: 'Invite insert failed' })
  })
})

describe('acceptInvite', () => {
  it('finds the invite, joins the couple, and marks invite as accepted', async () => {
    const { acceptInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    const qb = mockAdmin._queryBuilder
    mockAdmin._queryBuilder.single.mockResolvedValueOnce({ data: mockInvite, error: null })
    qb.eq
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(qb)
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: null })

    const result = await acceptInvite('mock-token')

    expect(mockAdmin.from).toHaveBeenCalledWith('couple_invites')
    expect(qb.eq).toHaveBeenCalledWith('token', 'mock-token')
    expect(qb.eq).toHaveBeenCalledWith('status', 'pending')
    expect(mockAdmin.from).toHaveBeenCalledWith('profiles')
    expect(qb.update).toHaveBeenCalledWith({ couple_id: 'couple-1' })
    expect(qb.update).toHaveBeenCalledWith({ status: 'accepted' })
    expect(result).toEqual({ error: null })
  })

  it('returns error when not authenticated', async () => {
    const { acceptInvite } = await import('@/lib/couples')
    setupUnauthenticatedUser()

    const result = await acceptInvite('mock-token')

    expect(result).toEqual({ error: 'Not authenticated' })
  })

  it('returns error when invite is not found', async () => {
    const { acceptInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockAdmin._queryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No rows found' },
    })

    const result = await acceptInvite('invalid-token')

    expect(result).toEqual({ error: 'No rows found' })
  })

  it('returns error when profile update fails during join', async () => {
    const { acceptInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    const qb = mockAdmin._queryBuilder
    qb.single.mockResolvedValueOnce({ data: mockInvite, error: null })
    qb.eq
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(qb)
      .mockResolvedValueOnce({ data: null, error: { message: 'Join failed' } })

    const result = await acceptInvite('mock-token')

    expect(result).toEqual({ error: 'Join failed' })
  })

  it('returns error when invite status update fails', async () => {
    const { acceptInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    const qb = mockAdmin._queryBuilder
    qb.single.mockResolvedValueOnce({ data: mockInvite, error: null })
    qb.eq
      .mockReturnValueOnce(qb)
      .mockReturnValueOnce(qb)
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Status update failed' } })

    const result = await acceptInvite('mock-token')

    expect(result).toEqual({ error: 'Status update failed' })
  })

  it('returns fallback message when invite not found and no error message', async () => {
    const { acceptInvite } = await import('@/lib/couples')
    setupAuthenticatedUser()

    mockAdmin._queryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    const result = await acceptInvite('expired-token')

    expect(result).toEqual({ error: 'Invite not found or expired' })
  })
})
