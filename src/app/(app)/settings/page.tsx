import { Settings } from 'lucide-react'

import { requireAuth } from '@/lib/auth'
import { getCouple, getPartner } from '@/lib/couples'
import type { DbCoupleInvite, DbSessionSettings } from '@/types'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

async function getSessionSettings(
  supabase: Awaited<ReturnType<typeof requireAuth>>['supabase'],
  coupleId: string,
): Promise<DbSessionSettings | null> {
  const { data } = await supabase
    .from('session_settings')
    .select('*')
    .eq('couple_id', coupleId)
    .single()
  return data as DbSessionSettings | null
}

async function getPendingInvite(
  supabase: Awaited<ReturnType<typeof requireAuth>>['supabase'],
  coupleId: string,
): Promise<DbCoupleInvite | null> {
  const { data } = await supabase
    .from('couple_invites')
    .select('*')
    .eq('couple_id', coupleId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as DbCoupleInvite | null
}

export default async function SettingsPage() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-destructive">Profile not found.</p>
      </div>
    )
  }

  const { data: couple } = await getCouple()
  const { data: partner } = await getPartner()

  let sessionSettings: DbSessionSettings | null = null
  let pendingInvite: DbCoupleInvite | null = null

  if (profile.couple_id) {
    sessionSettings = await getSessionSettings(supabase, profile.couple_id)
    pendingInvite = await getPendingInvite(supabase, profile.couple_id)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Settings className="h-7 w-7" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, couple, and app preferences
          </p>
        </div>
      </div>

      <SettingsTabs
        profile={profile}
        couple={couple}
        partner={partner}
        sessionSettings={sessionSettings}
        pendingInvite={pendingInvite}
      />
    </div>
  )
}
