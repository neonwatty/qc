import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUserId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  // Add exchangeCodeForSession to auth mock
  mockSupabase.auth.exchangeCodeForSession = vi.fn()

  const { createClient } = await import('@/lib/supabase/server')
  ;(createClient as ReturnType<typeof vi.fn>).mockResolvedValue(mockSupabase)
})

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL('http://localhost:3000/auth/callback')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return new Request(url.toString())
}

function getRedirectPath(response: Response): string {
  const location = response.headers.get('Location')
  if (!location) return ''
  const url = new URL(location)
  return url.pathname + url.search
}

describe('GET /auth/callback', () => {
  it('redirects to /login with error when code param is missing', async () => {
    const { GET } = await import('./route')

    const response = await GET(makeRequest())

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/login?error=Missing%20authorization%20code')
  })

  it('redirects to /login with error when code exchange fails', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid code' },
    })

    const response = await GET(makeRequest({ code: 'bad-code' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/login?error=Invalid%20code')
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('bad-code')
  })

  it('redirects to /onboarding when user has no couple', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: { id: mockUserId }, session: {} },
      error: null,
    })
    mockSupabase._queryBuilder.single = vi.fn().mockResolvedValue({
      data: { couple_id: null },
      error: null,
    })

    const response = await GET(makeRequest({ code: 'valid-code' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/onboarding')
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    expect(mockSupabase._queryBuilder.select).toHaveBeenCalledWith('couple_id')
    expect(mockSupabase._queryBuilder.eq).toHaveBeenCalledWith('id', mockUserId)
  })

  it('redirects to /dashboard when user has couple and no redirect param', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: { id: mockUserId }, session: {} },
      error: null,
    })
    mockSupabase._queryBuilder.single = vi.fn().mockResolvedValue({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const response = await GET(makeRequest({ code: 'valid-code' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/dashboard')
  })

  it('redirects to specified path when user has couple and valid redirect param', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: { id: mockUserId }, session: {} },
      error: null,
    })
    mockSupabase._queryBuilder.single = vi.fn().mockResolvedValue({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const response = await GET(makeRequest({ code: 'valid-code', redirect: '/notes' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/notes')
  })

  it('redirects to /dashboard when redirect param is malicious (external URL)', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: { id: mockUserId }, session: {} },
      error: null,
    })
    mockSupabase._queryBuilder.single = vi.fn().mockResolvedValue({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const response = await GET(makeRequest({ code: 'valid-code', redirect: '//evil.com' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/dashboard')
  })

  it('redirects to /dashboard when redirect param is a full external URL', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: { id: mockUserId }, session: {} },
      error: null,
    })
    mockSupabase._queryBuilder.single = vi.fn().mockResolvedValue({
      data: { couple_id: mockCoupleId },
      error: null,
    })

    const response = await GET(makeRequest({ code: 'valid-code', redirect: 'https://evil.com/steal' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/dashboard')
  })

  it('redirects to /onboarding when profile query returns no data', async () => {
    const { GET } = await import('./route')

    mockSupabase.auth.exchangeCodeForSession = vi.fn().mockResolvedValue({
      data: { user: { id: mockUserId }, session: {} },
      error: null,
    })
    mockSupabase._queryBuilder.single = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const response = await GET(makeRequest({ code: 'valid-code' }))

    expect(response.status).toBe(307)
    const redirectPath = getRedirectPath(response)
    expect(redirectPath).toBe('/onboarding')
  })
})
