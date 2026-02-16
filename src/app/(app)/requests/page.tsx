import { requireAuth } from '@/lib/auth'
import { snakeToCamelObject } from '@/lib/utils'
import { RequestInbox } from '@/components/requests/RequestInbox'
import type { RelationshipRequest } from '@/types'
import type { DbRequest } from '@/types/database'

export const metadata = {
  title: 'Requests',
  description: 'View and manage relationship requests from your partner',
}

export default async function RequestsPage() {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Requests</h1>
        <p className="mt-4 text-muted-foreground">
          You need to be part of a couple to use requests.
        </p>
      </div>
    )
  }

  const { data: partners } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('couple_id', profile.couple_id)
    .neq('id', user.id)

  const partnerId = partners?.[0]?.id ?? null
  const partnerName = partners?.[0]?.display_name ?? partners?.[0]?.email ?? 'Partner'

  const { data: rows } = await supabase
    .from('requests')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .order('created_at', { ascending: false })

  const requests: RelationshipRequest[] = (rows ?? []).map((row: DbRequest) =>
    snakeToCamelObject<RelationshipRequest>(row as unknown as Record<string, unknown>),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <RequestInbox
        initialRequests={requests}
        coupleId={profile.couple_id}
        currentUserId={user.id}
        partnerId={partnerId}
        partnerName={partnerName}
      />
    </div>
  )
}
