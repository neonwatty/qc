import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured')
    _resend = new Resend(apiKey)
  }
  return _resend
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

export const BATCH_SIZE = 100
