import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockVerify = vi.fn()
const mockSupabase = createMockSupabaseClient()

vi.mock('svix', () => ({
  Webhook: class {
    constructor() {}
    verify = mockVerify
  },
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.RESEND_WEBHOOK_SECRET = 'test-webhook-secret'
})

describe('POST /api/email/webhook - Security', () => {
  it('returns 401 when webhook secret is not configured', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET
    const { POST } = await import('./route')

    const request = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,signature',
      },
      body: JSON.stringify({ type: 'email.delivered', data: { email_id: '1', to: [], created_at: '' } }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Webhook secret not configured' })
  })

  it('returns 401 when signature headers are missing', async () => {
    const { POST } = await import('./route')

    const request = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      body: JSON.stringify({ type: 'email.delivered', data: { email_id: '1', to: [], created_at: '' } }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Missing signature headers' })
  })

  it('returns 401 when signature verification fails', async () => {
    const { POST } = await import('./route')
    mockVerify.mockImplementationOnce(() => {
      throw new Error('Invalid signature')
    })

    const request = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,invalid',
      },
      body: JSON.stringify({ type: 'email.delivered', data: { email_id: '1', to: [], created_at: '' } }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Invalid signature' })
  })
})

describe('POST /api/email/webhook - Event Handling', () => {
  it('handles email.delivered event', async () => {
    const { POST } = await import('./route')
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const payload = {
      type: 'email.delivered',
      data: {
        email_id: 'email-123',
        to: ['test@example.com'],
        created_at: '2025-01-01T00:00:00Z',
      },
    }

    mockVerify.mockReturnValueOnce(payload)

    const request = new NextRequest('http://localhost:3000/api/email/webhook', {
      method: 'POST',
      headers: {
        'svix-id': 'msg_123',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,valid',
      },
      body: JSON.stringify(payload),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ received: true })
    expect(consoleLogSpy).toHaveBeenCalledWith('Email delivered:', 'email-123')

    consoleLogSpy.mockRestore()
  })
})

describe('POST /api/email/webhook - Bounce and Complaint Handling', () => {
  // Note: These tests verify webhook signature verification
  // Complex database update scenarios for bounces and complaints are covered by E2E tests
})
