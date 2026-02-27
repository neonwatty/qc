import { describe, it, expect, vi, beforeEach } from 'vitest'

const MockResend = vi.fn(function (this: { key: string }, key: string) {
  this.key = key
})

vi.mock('resend', () => ({
  Resend: MockResend,
}))

describe('resend', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    MockResend.mockClear()
  })

  describe('getResend', () => {
    it('throws when RESEND_API_KEY is not set', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      const { getResend } = await import('./resend')

      expect(() => getResend()).toThrow('RESEND_API_KEY is not configured')
    })

    it('throws when RESEND_API_KEY is undefined', async () => {
      delete process.env.RESEND_API_KEY

      const { getResend } = await import('./resend')

      expect(() => getResend()).toThrow('RESEND_API_KEY is not configured')
    })

    it('creates a Resend instance with the API key', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test-api-key-123')

      const { getResend } = await import('./resend')
      const client = getResend()

      expect(client).toHaveProperty('key', 'test-api-key-123')
    })

    it('returns the same singleton on subsequent calls', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test-api-key-123')

      const { getResend } = await import('./resend')
      const first = getResend()
      const second = getResend()

      expect(first).toBe(second)
    })

    it('passes API key to Resend constructor', async () => {
      vi.stubEnv('RESEND_API_KEY', 'my-secret-key')

      const { getResend } = await import('./resend')
      getResend()

      expect(MockResend).toHaveBeenCalledWith('my-secret-key')
    })
  })

  describe('EMAIL_FROM', () => {
    it('defaults to onboarding@resend.dev when EMAIL_FROM env is not set', async () => {
      delete process.env.EMAIL_FROM

      const { EMAIL_FROM } = await import('./resend')

      expect(EMAIL_FROM).toBe('onboarding@resend.dev')
    })

    it('uses EMAIL_FROM env var when set', async () => {
      vi.stubEnv('EMAIL_FROM', 'hello@tryqc.co')

      const { EMAIL_FROM } = await import('./resend')

      expect(EMAIL_FROM).toBe('hello@tryqc.co')
    })
  })

  describe('BATCH_SIZE', () => {
    it('is 100', async () => {
      const { BATCH_SIZE } = await import('./resend')

      expect(BATCH_SIZE).toBe(100)
    })
  })
})
