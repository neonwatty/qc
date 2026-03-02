import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSelect = vi.fn()
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: mockFrom }),
}))

import { GET } from './route'

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockReturnValue({ limit: () => ({ error: null }) })
  })

  it('returns 200 status with ok when DB is healthy', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      checks: { database: 'ok' },
    })
  })

  it('returns 503 when DB query returns error', async () => {
    mockSelect.mockReturnValue({ limit: () => ({ error: new Error('connection refused') }) })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('degraded')
    expect(data.checks.database).toBe('error')
  })

  it('returns a valid ISO 8601 timestamp', async () => {
    const response = await GET()
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })
})
