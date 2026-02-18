import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'

const mockSend = vi.fn()
const mockBatchSend = vi.fn()

vi.mock('./resend', () => ({
  getResend: vi.fn().mockReturnValue({
    emails: { send: mockSend },
    batch: { send: mockBatchSend },
  }),
  EMAIL_FROM: 'onboarding@resend.dev',
  BATCH_SIZE: 2,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockReactElement = createElement('div', null, 'Hello')

describe('sendEmail', () => {
  it('sends an email successfully', async () => {
    const { sendEmail } = await import('./send')

    mockSend.mockResolvedValueOnce({ data: { id: 'email-1' }, error: null })

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      react: mockReactElement,
    })

    expect(result).toEqual({ data: { id: 'email-1' }, error: null })
    expect(mockSend).toHaveBeenCalledWith({
      from: 'onboarding@resend.dev',
      to: 'test@example.com',
      subject: 'Test Subject',
      react: mockReactElement,
    })
  })

  it('returns error when Resend API fails', async () => {
    const { sendEmail } = await import('./send')

    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'Resend API error' } })

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      react: mockReactElement,
    })

    expect(result.error).toEqual({ message: 'Resend API error' })
  })
})

describe('sendBatchEmails', () => {
  it('sends all emails successfully', async () => {
    const { sendBatchEmails } = await import('./send')

    mockBatchSend.mockResolvedValue({ data: {}, error: null })

    const result = await sendBatchEmails({
      recipients: ['a@test.com', 'b@test.com'],
      subject: 'Batch Test',
      react: mockReactElement,
    })

    expect(result).toEqual({ sent: 2, failed: 0, errors: [] })
  })

  it('handles partial batch failure', async () => {
    const { sendBatchEmails } = await import('./send')

    // BATCH_SIZE is mocked to 2, so 3 recipients = 2 batches
    mockBatchSend
      .mockResolvedValueOnce({ data: {}, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Batch failed' } })

    const result = await sendBatchEmails({
      recipients: ['a@test.com', 'b@test.com', 'c@test.com'],
      subject: 'Batch Test',
      react: mockReactElement,
    })

    expect(result.sent).toBe(2)
    expect(result.failed).toBe(1)
    expect(result.errors).toContain('Batch failed')
  })

  it('handles all batches failing', async () => {
    const { sendBatchEmails } = await import('./send')

    mockBatchSend.mockResolvedValue({ data: null, error: { message: 'All failed' } })

    const result = await sendBatchEmails({
      recipients: ['a@test.com', 'b@test.com'],
      subject: 'Batch Test',
      react: mockReactElement,
    })

    expect(result.sent).toBe(0)
    expect(result.failed).toBe(2)
    expect(result.errors).toContain('All failed')
  })
})
