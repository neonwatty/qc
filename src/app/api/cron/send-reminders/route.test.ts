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
  function createBuilder() {
    const builder: Record<string, ReturnType<typeof vi.fn>> = {}
    const methods = ['select', 'eq', 'in', 'lte', 'update']
    for (const m of methods) builder[m] = vi.fn().mockReturnValue(builder)
    return builder
  }

  const mockReminder = {
    id: 'reminder-1',
    couple_id: 'couple-1',
    created_by: 'user-1',
    title: 'Date Night',
    message: 'Plan something fun!',
    notification_channel: 'email',
    frequency: 'once',
  }

  const mockProfile = {
    id: 'user-1',
    email: 'alice@example.com',
    email_unsubscribe_token: 'unsub-token',
    email_bounced_at: null,
    email_complained_at: null,
    email_opted_out_at: null,
  }

  function setupEmailMocks(reminders: unknown[] = [mockReminder], profiles: unknown[] = [mockProfile]) {
    let reminderCallCount = 0
    mockSupabase.from = vi.fn().mockImplementation((table: string) => {
      const builder = createBuilder()
      if (table === 'reminders') {
        reminderCallCount++
        if (reminderCallCount === 1) {
          // First call: query for due reminders — chain ends at .lte()
          builder['lte'] = vi.fn().mockResolvedValue({ data: reminders, error: null })
        } else {
          // Second call: deactivation update — chain ends at .eq()
          builder['eq'] = vi.fn().mockResolvedValue({ data: null, error: null })
        }
      } else if (table === 'profiles') {
        // Profile lookup — chain ends at .in()
        builder['in'] = vi.fn().mockResolvedValue({ data: profiles, error: null })
      }
      return builder
    })
  }

  it('sends email for due reminders', async () => {
    const { GET } = await import('./route')

    setupEmailMocks()
    mockSend.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })

    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: { authorization: 'Bearer test-secret-key' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sent).toBe(1)
    expect(data.failed).toBe(0)
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'alice@example.com',
        subject: 'Reminder: Date Night',
      }),
    )
  })

  it('skips reminders with bounced email addresses', async () => {
    const { GET } = await import('./route')

    const bouncedProfile = {
      ...mockProfile,
      email_bounced_at: '2025-01-01T00:00:00Z',
    }

    setupEmailMocks([mockReminder], [bouncedProfile])

    const request = new NextRequest('http://localhost:3000/api/cron/send-reminders', {
      headers: { authorization: 'Bearer test-secret-key' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.sent).toBe(0)
    expect(mockSend).not.toHaveBeenCalled()
  })
})
