import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: implement reminder logic
  // 1. Query users who need reminders
  // 2. Send reminder emails via sendBatchEmails()
  // 3. Update last_reminded_at timestamps

  return NextResponse.json({
    status: 'ok',
    sent: 0,
    timestamp: new Date().toISOString(),
  })
}
