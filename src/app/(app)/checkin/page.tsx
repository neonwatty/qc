import { redirect } from 'next/navigation'

import { requireAuth } from '@/lib/auth'
import { CheckInProvider } from '@/contexts/CheckInContext'
import { BookendsProvider } from '@/contexts/BookendsContext'
import { SessionSettingsProvider } from '@/contexts/SessionSettingsContext'
import { CheckInWizard } from '@/components/checkin/CheckInWizard'
import { PrepBanner } from '@/components/bookends/PrepBanner'

export default async function CheckInPage(): Promise<React.ReactNode> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    redirect('/dashboard')
  }

  return (
    <SessionSettingsProvider coupleId={profile.couple_id}>
      <CheckInProvider coupleId={profile.couple_id}>
        <BookendsProvider>
          <div className="mx-auto max-w-2xl px-4 py-6">
            <PrepBanner />
            <CheckInWizard coupleId={profile.couple_id} userId={user.id} />
          </div>
        </BookendsProvider>
      </CheckInProvider>
    </SessionSettingsProvider>
  )
}
