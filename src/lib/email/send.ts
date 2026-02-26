import type { ReactElement } from 'react'

import { createAdminClient } from '@/lib/supabase/admin'

import { getResend, EMAIL_FROM, BATCH_SIZE } from './resend'

interface SendEmailParams {
  to: string
  subject: string
  react: ReactElement
}

interface SendEmailResult {
  data: { id: string } | null
  error: { message: string } | null
}

export async function sendEmail({ to, subject, react }: SendEmailParams): Promise<SendEmailResult> {
  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    react,
  })

  return { data, error }
}

interface BatchEmailParams {
  recipients: string[]
  subject: string
  react: ReactElement
}

interface BatchEmailResult {
  sent: number
  failed: number
  errors: string[]
}

/** @public */
export async function sendBatchEmails({ recipients, subject, react }: BatchEmailParams): Promise<BatchEmailResult> {
  const result: BatchEmailResult = { sent: 0, failed: 0, errors: [] }

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const emails = batch.map((to) => ({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    }))

    const { error } = await getResend().batch.send(emails)

    if (error) {
      result.failed += batch.length
      result.errors.push(error.message)
    } else {
      result.sent += batch.length
    }
  }

  return result
}

/**
 * Check if we should send email to this address.
 * Returns false if the profile has bounced, complained, or opted out.
 */
export async function shouldSendEmail(email: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('email_bounced_at, email_complained_at, email_opted_out_at')
    .eq('email', email)
    .maybeSingle()

  if (!data) return true // Unknown email — allow sending (e.g., invite to non-user)
  if (data.email_bounced_at) return false
  if (data.email_complained_at) return false
  if (data.email_opted_out_at) return false
  return true
}
