'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { acceptInviteAction } from './actions'

interface AcceptInviteCardProps {
  token: string
  inviterName: string
  invitedEmail: string
}

export function AcceptInviteCard({ token, inviterName, invitedEmail }: AcceptInviteCardProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptInviteAction(token)
      if (!result.success) {
        setError(result.error ?? 'Something went wrong')
      }
      // On success the server action redirects to /dashboard
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <CardTitle>You have been invited!</CardTitle>
        <CardDescription>{inviterName} has invited you to join them on QC as a couple.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-3 text-center text-sm">
          <p className="text-muted-foreground">Invitation sent to</p>
          <p className="font-medium">{invitedEmail}</p>
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button onClick={handleAccept} className="w-full" disabled={isPending}>
          {isPending ? 'Joining...' : 'Accept and join'}
        </Button>
      </CardContent>
    </Card>
  )
}
