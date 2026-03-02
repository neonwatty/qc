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
    const userMessage = error.message.includes('expired')
      ? 'Your login link has expired. Please try signing in again.'
      : error.message.includes('already')
        ? 'This login link has already been used. Please try signing in again.'
        : 'Authentication failed. Please try again.'
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(userMessage)}`)
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
