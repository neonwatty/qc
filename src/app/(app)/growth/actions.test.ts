import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockMilestoneId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(),
  shouldSendEmail: vi.fn(),
}))
vi.mock('@/lib/email/templates/milestone', () => ({
  MilestoneEmail: vi.fn().mockReturnValue(null),
}))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()

  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
    supabase: mockSupabase,
  })
})

/**
 * Helper that configures mockSupabase.from to return different query builders
 * for different table names.
 */
function setupFromMock(tableResponses: Record<string, { data: unknown; error: unknown; terminal?: 'single' }>) {
  mockSupabase.from = vi.fn().mockImplementation((table: string) => {
    const response = tableResponses[table] ?? { data: null, error: null }
    const builder: Record<string, ReturnType<typeof vi.fn>> = {}
    const methods = ['select', 'eq', 'insert', 'update', 'delete', 'order', 'limit']
    for (const method of methods) {
      builder[method] = vi.fn().mockReturnValue(builder)
    }
    if (response.terminal === 'single') {
      builder['single'] = vi.fn().mockResolvedValue({ data: response.data, error: response.error })
    } else {
      const resolvedValue = { data: response.data, error: response.error }
      builder['eq'] = vi.fn().mockReturnValue(resolvedValue)
      builder['select'] = vi.fn().mockReturnValue({ ...builder, eq: builder['eq'] })
    }
    return builder
  })
}

describe('sendMilestoneEmail', () => {
  it('sends email to both partners', async () => {
    const { sendMilestoneEmail } = await import('./actions')
    const { sendEmail, shouldSendEmail } = await import('@/lib/email/send')
    ;(shouldSendEmail as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    ;(sendEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 'email-1' }, error: null })

    setupFromMock({
      milestones: {
        data: {
          couple_id: mockCoupleId,
          title: 'First Check-In',
          description: 'Completed first check-in',
          rarity: 'common',
        },
        error: null,
        terminal: 'single',
      },
      profiles: {
        data: [{ email: 'alice@example.com' }, { email: 'bob@example.com' }],
        error: null,
      },
    })

    await sendMilestoneEmail(mockMilestoneId)

    expect(sendEmail).toHaveBeenCalledTimes(2)
    expect(shouldSendEmail).toHaveBeenCalledTimes(2)
    expect(shouldSendEmail).toHaveBeenCalledWith('alice@example.com')
    expect(shouldSendEmail).toHaveBeenCalledWith('bob@example.com')
  })

  it('skips partner whose email has bounced', async () => {
    const { sendMilestoneEmail } = await import('./actions')
    const { sendEmail, shouldSendEmail } = await import('@/lib/email/send')
    ;(shouldSendEmail as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(true) // alice can receive
      .mockResolvedValueOnce(false) // bob bounced
    ;(sendEmail as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { id: 'email-1' }, error: null })

    setupFromMock({
      milestones: {
        data: { couple_id: mockCoupleId, title: 'First Check-In', description: null, rarity: 'rare' },
        error: null,
        terminal: 'single',
      },
      profiles: {
        data: [{ email: 'alice@example.com' }, { email: 'bob@example.com' }],
        error: null,
      },
    })

    await sendMilestoneEmail(mockMilestoneId)

    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@example.com' }))
  })

  it('does not throw when sendEmail fails', async () => {
    const { sendMilestoneEmail } = await import('./actions')
    const { sendEmail, shouldSendEmail } = await import('@/lib/email/send')
    ;(shouldSendEmail as ReturnType<typeof vi.fn>).mockResolvedValue(true)
    ;(sendEmail as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('RESEND_API_KEY not configured'))

    setupFromMock({
      milestones: {
        data: { couple_id: mockCoupleId, title: 'First Check-In', description: null, rarity: 'common' },
        error: null,
        terminal: 'single',
      },
      profiles: {
        data: [{ email: 'alice@example.com' }, { email: 'bob@example.com' }],
        error: null,
      },
    })

    await expect(sendMilestoneEmail(mockMilestoneId)).resolves.toBeUndefined()
  })

  it('returns early when milestone not found', async () => {
    const { sendMilestoneEmail } = await import('./actions')
    const { sendEmail } = await import('@/lib/email/send')

    setupFromMock({
      milestones: {
        data: null,
        error: { message: 'Not found' },
        terminal: 'single',
      },
    })

    await sendMilestoneEmail(mockMilestoneId)

    expect(sendEmail).not.toHaveBeenCalled()
  })
})
