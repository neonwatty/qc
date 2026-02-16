import { NextRequest, NextResponse } from 'next/server'

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

  switch (payload.type) {
    case 'email.delivered': {
      // TODO: log successful delivery
      console.log('Email delivered:', payload.data.email_id)
      break
    }

    case 'email.bounced': {
      // TODO: mark email as bounced, disable future sends
      console.log('Email bounced:', payload.data.to)
      break
    }

    case 'email.complained': {
      // TODO: unsubscribe user, log complaint
      console.log('Email complaint:', payload.data.to)
      break
    }
  }

  return NextResponse.json({ received: true })
}
