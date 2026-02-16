import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }): Promise<React.ReactNode> {
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Fetch user profile and couple info
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, couple_id')
    .eq('id', user.id)
    .single()

  let coupleName: string | null = null
  if (profile?.couple_id) {
    const { data: couple } = await supabase.from('couples').select('name').eq('id', profile.couple_id).single()
    coupleName = couple?.name ?? null
  }

  return (
    <AppShell
      userEmail={user.email ?? ''}
      displayName={profile?.display_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      coupleName={coupleName}
    >
      {children}
    </AppShell>
  )
}
