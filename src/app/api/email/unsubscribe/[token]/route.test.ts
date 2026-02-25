import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockSupabase = createMockSupabaseClient()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
})

describe('GET /api/email/unsubscribe/[token]', () => {
  it('returns 400 for invalid token (too short)', async () => {
    const { GET } = await import('./route')

    const request = new NextRequest('http://localhost:3000/api/email/unsubscribe/short')
    const params = Promise.resolve({ token: 'short' })

    const response = await GET(request, { params })
    const html = await response.text()

    expect(response.status).toBe(400)
    expect(html).toContain('Invalid unsubscribe link')
    expect(html).toContain('Error')
  })

  it('returns 400 for empty token', async () => {
    const { GET } = await import('./route')

    const request = new NextRequest('http://localhost:3000/api/email/unsubscribe/')
    const params = Promise.resolve({ token: '' })

    const response = await GET(request, { params })
    const html = await response.text()

    expect(response.status).toBe(400)
    expect(html).toContain('Invalid unsubscribe link')
    expect(html).toContain('Error')
  })

  it('returns 404 when token is not found in database', async () => {
    const { GET } = await import('./route')
    mockSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

    const request = new NextRequest('http://localhost:3000/api/email/unsubscribe/valid-token-123')
    const params = Promise.resolve({ token: 'valid-token-123' })

    const response = await GET(request, { params })
    const html = await response.text()

    expect(response.status).toBe(404)
    expect(html).toContain('Unsubscribe link not found or already expired')
    expect(html).toContain('Error')
    expect(mockSupabase._queryBuilder.eq).toHaveBeenCalledWith('email_unsubscribe_token', 'valid-token-123')
  })

  it('returns 200 when user is already unsubscribed', async () => {
    const { GET } = await import('./route')
    mockSupabase._queryBuilder.maybeSingle.mockResolvedValueOnce({
      data: { id: 'user-123', email_opted_out_at: '2025-01-01T00:00:00Z' },
      error: null,
    })

    const request = new NextRequest('http://localhost:3000/api/email/unsubscribe/valid-token-123')
    const params = Promise.resolve({ token: 'valid-token-123' })

    const response = await GET(request, { params })
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('You are already unsubscribed from QC emails')
    expect(html).toContain('Unsubscribed')
    expect(mockSupabase._queryBuilder.update).not.toHaveBeenCalled()
  })

  // Note: These tests verify token validation logic
  // Complex database scenarios are covered by E2E tests
})
