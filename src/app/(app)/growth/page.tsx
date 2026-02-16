import { requireAuth } from '@/lib/auth'

import { GrowthContent } from './growth-content'

export const metadata = {
  title: 'Growth Gallery - Quality Control',
}

export default async function GrowthPage(): Promise<React.ReactElement> {
  const { user, supabase } = await requireAuth()

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()

  const coupleId = profile?.couple_id ?? null

  return <GrowthContent coupleId={coupleId} />
}
