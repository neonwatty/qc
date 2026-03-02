import { NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(): Promise<NextResponse> {
  let dbStatus = 'ok'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).limit(1)
    if (error) dbStatus = 'error'
  } catch {
    dbStatus = 'unreachable'
  }

  const status = dbStatus === 'ok' ? 200 : 503

  return NextResponse.json(
    {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database: dbStatus },
    },
    { status },
  )
}
