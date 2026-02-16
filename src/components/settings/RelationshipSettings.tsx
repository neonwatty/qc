'use client'

import { useState } from 'react'

import { leaveCoupleAction, resendInviteAction } from '@/app/(app)/settings/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { DbCouple } from '@/types/database'

interface Props {
  couple: DbCouple | null
  partner: { id: string; display_name: string | null; email: string } | null
  pendingInvite: { id: string; invited_email: string; status: string } | null
}

export function RelationshipSettings({ couple, partner, pendingInvite }: Props): React.ReactElement {
  const [resending, setResending] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResendInvite(): Promise<void> {
    if (!pendingInvite) return
    setResending(true)
    setError(null)
    const result = await resendInviteAction(pendingInvite.id)
    if (result.error) setError(result.error)
    setResending(false)
  }

  async function handleLeaveCouple(): Promise<void> {
    setLeaving(true)
    setError(null)
    const result = await leaveCoupleAction()
    if (result?.error) {
      setError(result.error)
      setLeaving(false)
    }
  }

  if (!couple) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Relationship</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You are not currently in a couple. Complete onboarding to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Relationship</h2>
          <p className="text-sm text-muted-foreground">Manage your couple settings</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {couple.name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Couple Name</p>
              <p className="font-medium">{couple.name}</p>
            </div>
          )}

          {couple.relationship_start_date && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Together Since</p>
              <p className="font-medium">{new Date(couple.relationship_start_date).toLocaleDateString()}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">Partner</p>
            {partner ? (
              <p className="font-medium">{partner.display_name ?? partner.email}</p>
            ) : pendingInvite ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Invite sent to <span className="font-medium">{pendingInvite.invited_email}</span>
                </p>
                <Button variant="outline" size="sm" onClick={handleResendInvite} disabled={resending}>
                  {resending ? 'Resending...' : 'Resend Invite'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No partner yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Leaving a couple will remove your access to shared data. This action cannot be easily undone.
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {confirmLeave ? (
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleLeaveCouple} disabled={leaving}>
                {leaving ? 'Leaving...' : 'Confirm Leave'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmLeave(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmLeave(true)}>
              Leave Couple
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
