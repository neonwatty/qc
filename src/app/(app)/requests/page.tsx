import { requireAuth } from '@/lib/auth'

import { RequestsContent } from './requests-content'

export default async function RequestsPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  const [{ data: requests }, { data: partner }] = await Promise.all([
    coupleId
      ? supabase
          .from('requests')
          .select('*')
          .eq('couple_id', coupleId)
          .order('created_at', { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [] as never[] }),
    coupleId
      ? supabase.from('profiles').select('id, display_name').eq('couple_id', coupleId).neq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

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
