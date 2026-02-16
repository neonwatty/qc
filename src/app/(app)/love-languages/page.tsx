import { requireAuth } from '@/lib/auth'
import { LoveLanguagesProvider } from '@/contexts/LoveLanguagesContext'
import { LoveLanguagesPageClient } from '@/components/love-languages/LoveLanguagesPageClient'

export default async function LoveLanguagesPage(): Promise<React.ReactNode> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  const coupleId = (profile?.couple_id as string) ?? null

  return (
    <LoveLanguagesProvider coupleId={coupleId} currentUserId={user.id}>
      <LoveLanguagesPageClient />
    </LoveLanguagesProvider>
  )
}
