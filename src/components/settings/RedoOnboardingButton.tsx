'use client'

import { useState } from 'react'

import { redoOnboarding } from '@/app/(app)/settings/actions/onboarding'
import { Button } from '@/components/ui/button'

export function RedoOnboardingButton(): React.ReactElement {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRedo(): Promise<void> {
    setLoading(true)
    setError(null)
    const result = await redoOnboarding()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Restart the onboarding process. This will delete all couple data and require re-inviting your partner.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {confirmOpen ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 space-y-2">
          <p className="text-sm font-medium text-destructive">
            This will permanently delete all shared data including notes, check-ins, reminders, and milestones. Are you
            sure?
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleRedo} disabled={loading}>
              {loading ? 'Resetting...' : 'Yes, Reset Everything'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmOpen(true)}>
          Restart Onboarding
        </Button>
      )}
    </div>
  )
}
