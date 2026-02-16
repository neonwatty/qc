'use client'

import { useState, useTransition } from 'react'
import { Clock, Mail, RefreshCw } from 'lucide-react'

import type { DbCoupleInvite } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resendPartnerInvite } from '@/app/(app)/settings/actions'

interface InviteStatusProps {
  invite: DbCoupleInvite | null
}

function formatExpiry(expiresAt: string): string {
  const expiry = new Date(expiresAt)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()

  if (diffMs <= 0) return 'Expired'

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} left`
  if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} left`
  return 'Less than an hour left'
}

export function InviteStatus({ invite }: InviteStatusProps) {
  const [error, setError] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!invite) return null

  const isExpired = new Date(invite.expires_at) <= new Date()

  function handleResend(): void {
    if (!invite) return
    setError(null)
    setResent(false)
    startTransition(async () => {
      const result = await resendPartnerInvite(invite.id)
      if (result.error) {
        setError(result.error)
      } else {
        setResent(true)
      }
    })
  }

  return (
    <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Mail className="h-5 w-5" />
          Pending Invite
        </CardTitle>
        <CardDescription>
          Your partner has been invited to join
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{invite.invited_email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={isExpired ? 'text-destructive' : ''}>
            {formatExpiry(invite.expires_at)}
          </span>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {resent && (
          <p className="text-sm text-green-600">Invite resent successfully</p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={isPending}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
          />
          {isPending ? 'Resending...' : 'Resend Invite'}
        </Button>
      </CardContent>
    </Card>
  )
}
