import { requireAuth } from '@/lib/auth'

import { RequestsContent } from './requests-content'

export default async function RequestsPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  const { data: requests } = coupleId
    ? await supabase
        .from('requests')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  // Get partner profile for creating requests
  const { data: partner } = coupleId
    ? await supabase.from('profiles').select('id, display_name').eq('couple_id', coupleId).neq('id', user.id).single()
    : { data: null }

  return (
    <RequestsContent
      initialRequests={requests ?? []}
      userId={user.id}
      coupleId={coupleId}
      partnerId={partner?.id ?? null}
      partnerName={partner?.display_name ?? 'Partner'}
    />
  )
}
