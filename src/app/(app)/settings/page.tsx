import { requireAuth } from '@/lib/auth'
import type { DbReminder } from '@/types/database'

import { SettingsContent } from './settings-content'

export default async function SettingsPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  const [{ data: couple }, { data: sessionSettings }, { data: partner }, { data: pendingInvite }, { data: reminders }] =
    await Promise.all([
      coupleId ? supabase.from('couples').select('*').eq('id', coupleId).single() : Promise.resolve({ data: null }),
      coupleId
        ? supabase.from('session_settings').select('*').eq('couple_id', coupleId).single()
        : Promise.resolve({ data: null }),
      coupleId
        ? supabase
            .from('profiles')
            .select('id, display_name, email')
            .eq('couple_id', coupleId)
            .neq('id', user.id)
            .single()
        : Promise.resolve({ data: null }),
      coupleId
        ? supabase
            .from('couple_invites')
            .select('id, invited_email, status')
            .eq('couple_id', coupleId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      coupleId
        ? supabase.from('reminders').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false })
        : Promise.resolve({ data: null }),
    ])

  return (
    <SettingsContent
      profile={profile}
      couple={couple}
      sessionSettings={sessionSettings}
      partner={partner}
      pendingInvite={pendingInvite}
      userEmail={user.email ?? ''}
      reminders={(reminders as DbReminder[]) ?? []}
    />
  )
}
