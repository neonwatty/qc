import { notFound, redirect } from 'next/navigation'

import { getUserOrNull } from '@/lib/auth'
import { getInviteByToken } from '@/lib/couples'
import { createAdminClient } from '@/lib/supabase/admin'

import { AcceptInviteCard } from './accept-invite-card'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params

  const user = await getUserOrNull()

  if (!user) {
    redirect(`/signup?redirect=/invite/${token}`)
  }

  const { data: invite, error } = await getInviteByToken(token)

  if (error || !invite) {
    notFound()
  }

  const admin = createAdminClient()
  const { data: inviter } = await admin
    .from('profiles')
    .select('display_name, email')
    .eq('id', invite.invited_by)
    .single()

  const inviterName = inviter?.display_name ?? inviter?.email ?? 'Someone'

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AcceptInviteCard token={token} inviterName={inviterName} invitedEmail={invite.invited_email} />
    </div>
  )
}
