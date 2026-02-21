import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

type ResendEventType = 'email.delivered' | 'email.bounced' | 'email.complained'

interface ResendWebhookPayload {
  type: ResendEventType
  data: {
    email_id: string
    to: string[]
    created_at: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  const signature = request.headers.get('svix-signature')

  if (webhookSecret && !signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const payload = (await request.json()) as ResendWebhookPayload
  const supabase = createAdminClient()

  switch (payload.type) {
    case 'email.delivered': {
      console.log('Email delivered:', payload.data.email_id)
      break
    }

    case 'email.bounced': {
      console.log('Email bounced:', payload.data.to)
      for (const email of payload.data.to) {
        const { error } = await supabase
          .from('profiles')
          .update({ email_bounced_at: new Date().toISOString() })
          .eq('email', email)
        if (error) console.error('Failed to record bounce for', email, error.message)
      }
      break
    }

    case 'email.complained': {
      console.log('Email complaint:', payload.data.to)
      for (const email of payload.data.to) {
        const { error } = await supabase
          .from('profiles')
          .update({ email_complained_at: new Date().toISOString() })
          .eq('email', email)
        if (error) console.error('Failed to record complaint for', email, error.message)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
