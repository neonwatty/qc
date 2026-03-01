import { NextResponse } from 'next/server'

import { sanitizeRedirect } from '@/lib/redirect'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = sanitizeRedirect(searchParams.get('redirect'))

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Missing authorization code')}`)
  }

  const supabase = await createClient()
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`,
    )
  }

  const userId = sessionData.user?.id
  if (userId) {
    const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', userId).single()

    if (!profile?.couple_id) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
