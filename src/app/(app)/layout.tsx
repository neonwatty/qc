import { requireAuth } from '@/lib/auth'

import { AppShell } from './app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireAuth()

  // Fetch the user's profile for display name and avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, couple_id')
    .eq('id', user.id)
    .single()

  return (
    <AppShell
      displayName={profile?.display_name ?? user.email?.split('@')[0] ?? null}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </AppShell>
  )
}
