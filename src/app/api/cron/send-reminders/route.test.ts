import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createElement } from 'react'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockSend = vi.fn()
const mockSupabase = createMockSupabaseClient()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: mockSend,
}))

vi.mock('@/lib/email/templates/reminder', () => ({
  ReminderEmail: vi.fn(() => createElement('div', null, 'Reminder Email')),
}))

beforeEach(() => {
  vi.clearAllMocks()
  process.env.CRON_SECRET = 'test-secret-key'
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
})

describe('GET /api/cron/send-reminders - Authorization', () => {
  it('returns 401 when authorization header is missing', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when authorization header is invalid', async () => {
    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: { authorization: 'Bearer wrong-secret' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('returns 401 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET
    const { GET } = await import('./route')
    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: { authorization: 'Bearer test-secret-key' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })
})

describe('GET /api/cron/send-reminders - Reminder Processing', () => {
  it('returns ok with sent: 0 when no reminders are due', async () => {
    const { GET } = await import('./route')
    mockSupabase._queryBuilder.lte.mockResolvedValueOnce({ data: [], error: null })

    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: { authorization: 'Bearer test-secret-key' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      status: 'ok',
      sent: 0,
      timestamp: expect.any(String),
    })
  })

  it('returns 500 when reminder query fails', async () => {
    const { GET } = await import('./route')
    mockSupabase._queryBuilder.lte.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: { authorization: 'Bearer test-secret-key' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'DB error' })
  })
})

describe('GET /api/cron/send-reminders - Email Sending', () => {
  it.todo('sends email for due reminders')
  it.todo('skips reminders with bounced email addresses')
})
