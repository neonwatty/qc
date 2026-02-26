import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextResponse } from 'next/server'

import { addSecurityHeaders, isAllowedEmail, isAppRoute, isPublicRoute, PUBLIC_ROUTES } from './middleware-utils'

// ---------------------------------------------------------------------------
// isPublicRoute
// ---------------------------------------------------------------------------

describe('isPublicRoute', () => {
  it.each(PUBLIC_ROUTES)('returns true for exact public route: %s', (route) => {
    expect(isPublicRoute(route)).toBe(true)
  })

  it('returns true for sub-paths of public routes', () => {
    expect(isPublicRoute('/invite/some-token')).toBe(true)
    expect(isPublicRoute('/api/cron/send-reminders')).toBe(true)
    expect(isPublicRoute('/auth/callback/google')).toBe(true)
    expect(isPublicRoute('/api/email/webhook/resend')).toBe(true)
    expect(isPublicRoute('/api/email/unsubscribe/abc123')).toBe(true)
    expect(isPublicRoute('/onboarding/step-2')).toBe(true)
  })

  it('returns false for protected routes', () => {
    expect(isPublicRoute('/dashboard')).toBe(false)
    expect(isPublicRoute('/settings')).toBe(false)
    expect(isPublicRoute('/notes')).toBe(false)
    expect(isPublicRoute('/check-in')).toBe(false)
    expect(isPublicRoute('/milestones')).toBe(false)
    expect(isPublicRoute('/love-languages')).toBe(false)
  })

  it('returns false for the root path /', () => {
    expect(isPublicRoute('/')).toBe(false)
  })

  it('returns false for routes that start with a public route prefix but without a slash separator', () => {
    // "/loginx" should NOT match "/login"
    expect(isPublicRoute('/loginx')).toBe(false)
    expect(isPublicRoute('/signuppage')).toBe(false)
    expect(isPublicRoute('/privacypolicy')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isAppRoute
// ---------------------------------------------------------------------------

describe('isAppRoute', () => {
  it.each(['/dashboard', '/settings', '/check-in', '/notes', '/milestones', '/photos', '/love-languages'])(
    'returns true for app route: %s',
    (route) => {
      expect(isAppRoute(route)).toBe(true)
    },
  )

  it('returns true for sub-paths of app routes', () => {
    expect(isAppRoute('/dashboard/stats')).toBe(true)
    expect(isAppRoute('/settings/profile')).toBe(true)
    expect(isAppRoute('/notes/123')).toBe(true)
    expect(isAppRoute('/love-languages/actions')).toBe(true)
    expect(isAppRoute('/milestones/new')).toBe(true)
    expect(isAppRoute('/photos/gallery')).toBe(true)
  })

  it('returns false for non-app routes', () => {
    expect(isAppRoute('/login')).toBe(false)
    expect(isAppRoute('/signup')).toBe(false)
    expect(isAppRoute('/api/health')).toBe(false)
    expect(isAppRoute('/onboarding')).toBe(false)
    expect(isAppRoute('/')).toBe(false)
    expect(isAppRoute('/invite/abc')).toBe(false)
    expect(isAppRoute('/privacy')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isAllowedEmail
// ---------------------------------------------------------------------------

describe('isAllowedEmail', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns true for any email when ALLOWED_EMAILS is not set', () => {
    delete process.env.ALLOWED_EMAILS
    expect(isAllowedEmail('anyone@example.com')).toBe(true)
    expect(isAllowedEmail('random@test.org')).toBe(true)
  })

  it('returns true for any email when ALLOWED_EMAILS is empty string', () => {
    vi.stubEnv('ALLOWED_EMAILS', '')
    expect(isAllowedEmail('anyone@example.com')).toBe(true)
  })

  it('returns true for emails in the allowlist', () => {
    vi.stubEnv('ALLOWED_EMAILS', 'a@b.com,c@d.com')
    expect(isAllowedEmail('a@b.com')).toBe(true)
    expect(isAllowedEmail('c@d.com')).toBe(true)
  })

  it('returns false for emails not in the allowlist', () => {
    vi.stubEnv('ALLOWED_EMAILS', 'a@b.com,c@d.com')
    expect(isAllowedEmail('x@y.com')).toBe(false)
    expect(isAllowedEmail('not@allowed.com')).toBe(false)
  })

  it('is case-insensitive', () => {
    vi.stubEnv('ALLOWED_EMAILS', 'a@b.com,c@d.com')
    expect(isAllowedEmail('A@B.COM')).toBe(true)
    expect(isAllowedEmail('C@D.Com')).toBe(true)
  })

  it('handles whitespace in the CSV value', () => {
    vi.stubEnv('ALLOWED_EMAILS', ' a@b.com , c@d.com ')
    expect(isAllowedEmail('a@b.com')).toBe(true)
    expect(isAllowedEmail('c@d.com')).toBe(true)
  })

  it('handles a single email in the allowlist', () => {
    vi.stubEnv('ALLOWED_EMAILS', 'only@one.com')
    expect(isAllowedEmail('only@one.com')).toBe(true)
    expect(isAllowedEmail('other@two.com')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// addSecurityHeaders
// ---------------------------------------------------------------------------

describe('addSecurityHeaders', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  function createMockResponse(): NextResponse {
    return new NextResponse()
  }

  it('sets X-Frame-Options to DENY', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
  })

  it('sets X-Content-Type-Options to nosniff', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin')
  })

  it('sets Permissions-Policy to disable camera, microphone, geolocation', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()')
  })

  it('sets Content-Security-Policy containing default-src self', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain("default-src 'self'")
  })

  it('includes unsafe-inline in script-src for Next.js hydration', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
  })

  it('includes frame-ancestors none in CSP', () => {
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('includes unsafe-eval in script-src during development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain("'unsafe-eval'")
  })

  it('excludes unsafe-eval in script-src during production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).not.toContain("'unsafe-eval'")
  })

  it('includes websocket sources in connect-src during development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain('ws://localhost:*')
    expect(csp).toContain('ws://127.0.0.1:*')
  })

  it('excludes websocket sources in connect-src during production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).not.toContain('ws://localhost:*')
    expect(csp).not.toContain('ws://127.0.0.1:*')
  })

  it('includes custom supabase URL in img-src and connect-src when not .supabase.co', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://custom-supabase.example.com')
    vi.stubEnv('NODE_ENV', 'production')
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    expect(csp).toContain('https://custom-supabase.example.com')
  })

  it('does not duplicate supabase.co URLs when NEXT_PUBLIC_SUPABASE_URL contains .supabase.co', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co')
    vi.stubEnv('NODE_ENV', 'production')
    const response = createMockResponse()
    addSecurityHeaders(response)
    const csp = response.headers.get('Content-Security-Policy')
    // The wildcard https://*.supabase.co already covers it, so the specific URL should not appear extra
    const imgSrcMatch = csp?.match(/img-src[^;]*/)?.[0] ?? ''
    expect(imgSrcMatch).not.toContain('https://abc.supabase.co')
  })
})
