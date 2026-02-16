'use client'

import { useActionState } from 'react'

import { acceptInviteAction } from './actions'
import type { InviteState } from './actions'

type Props = {
  token: string
}

export function InviteAcceptForm({ token }: Props) {
  const [state, formAction, isPending] = useActionState<InviteState, FormData>(acceptInviteAction, {
    error: null,
  })

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="touch-target gradient-primary w-full rounded-xl px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? 'Joining...' : 'Join as a Couple'}
      </button>
    </form>
  )
}
