import { requireAuth } from '@/lib/auth'

import { SettingsContent } from './settings-content'

export default async function SettingsPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  const { data: couple } = coupleId
    ? await supabase.from('couples').select('*').eq('id', coupleId).single()
    : { data: null }

  const { data: sessionSettings } = coupleId
    ? await supabase.from('session_settings').select('*').eq('couple_id', coupleId).single()
    : { data: null }

  const { data: partner } = coupleId
    ? await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('couple_id', coupleId)
        .neq('id', user.id)
        .single()
    : { data: null }

  const { data: pendingInvite } = coupleId
    ? await supabase
        .from('couple_invites')
        .select('id, invited_email, status')
        .eq('couple_id', coupleId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  return (
    <SettingsContent
      profile={profile}
      couple={couple}
      sessionSettings={sessionSettings}
      partner={partner}
      pendingInvite={pendingInvite}
      userEmail={user.email ?? ''}
    />
  )
}
