import type { ReactElement } from 'react'

import { resend, EMAIL_FROM, BATCH_SIZE } from './resend'

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
  const { data, error } = await resend.emails.send({
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

export async function sendBatchEmails({
  recipients,
  subject,
  react,
}: BatchEmailParams): Promise<BatchEmailResult> {
  const result: BatchEmailResult = { sent: 0, failed: 0, errors: [] }

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)
    const emails = batch.map((to) => ({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    }))

    const { error } = await resend.batch.send(emails)

    if (error) {
      result.failed += batch.length
      result.errors.push(error.message)
    } else {
      result.sent += batch.length
    }
  }

  return result
}
