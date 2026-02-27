import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAddSecurityHeaders = vi.fn()
const mockIsAllowedEmail = vi.fn().mockReturnValue(true)
const mockIsAppRoute = vi.fn().mockReturnValue(false)
const mockIsPublicRoute = vi.fn().mockReturnValue(false)

vi.mock('./middleware-utils', () => ({
  addSecurityHeaders: (...args: unknown[]) => mockAddSecurityHeaders(...args),
  isAllowedEmail: (...args: unknown[]) => mockIsAllowedEmail(...args),
  isAppRoute: (...args: unknown[]) => mockIsAppRoute(...args),
  isPublicRoute: (...args: unknown[]) => mockIsPublicRoute(...args),
}))

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } })
const mockSignOut = vi.fn().mockResolvedValue({ error: null })
const mockFrom = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser, signOut: mockSignOut },
    from: mockFrom,
  })),
}))

const { updateSession } = await import('./middleware')

function makeRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`)
  return {
    headers: new Headers(),
    cookies: { getAll: vi.fn().mockReturnValue([]), set: vi.fn() },
    nextUrl: {
      pathname,
      clone: () => new URL(url),
      searchParams: url.searchParams,
    },
  } as unknown as Parameters<typeof updateSession>[0]
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockIsAllowedEmail.mockReturnValue(true)
    mockIsAppRoute.mockReturnValue(false)
    mockIsPublicRoute.mockReturnValue(false)
  })

  it('adds security headers to all responses', async () => {
    mockIsPublicRoute.mockReturnValue(true)

    const response = await updateSession(makeRequest('/login'))

    expect(mockAddSecurityHeaders).toHaveBeenCalledWith(response)
  })

  it('allows public routes for unauthenticated users', async () => {
    mockIsPublicRoute.mockReturnValue(true)

    const response = await updateSession(makeRequest('/login'))

    expect(response.status).not.toBe(307)
  })

  it('redirects unauthenticated on protected routes to /login', async () => {
    const response = await updateSession(makeRequest('/dashboard'))

    expect(response.status).toBe(307)
    const location = response.headers.get('location') ?? ''
    expect(location).toContain('/login')
    expect(location).toContain('redirect=%2Fdashboard')
  })

  it('blocks users not on allowlist', async () => {
    const user = { id: 'u1', email: 'bad@example.com' }
    mockGetUser.mockResolvedValue({ data: { user } })
    mockIsAllowedEmail.mockReturnValue(false)

    const response = await updateSession(makeRequest('/dashboard'))

    expect(mockSignOut).toHaveBeenCalled()
    expect(response.status).toBe(307)
    const location = response.headers.get('location') ?? ''
    expect(location).toContain('/login')
    expect(location).toContain('error=Access')
  })

  it('redirects user without couple to /onboarding', async () => {
    const user = { id: 'u1', email: 'a@b.com' }
    mockGetUser.mockResolvedValue({ data: { user } })
    mockIsAppRoute.mockReturnValue(true)
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { couple_id: null } }),
        }),
      }),
    })

    const response = await updateSession(makeRequest('/dashboard'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/onboarding')
  })

  it('redirects user with couple away from /onboarding', async () => {
    const user = { id: 'u1', email: 'a@b.com' }
    mockGetUser.mockResolvedValue({ data: { user } })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { couple_id: 'c1' } }),
        }),
      }),
    })

    const response = await updateSession(makeRequest('/onboarding'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })
})
