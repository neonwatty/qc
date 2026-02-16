'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { leaveCoupleAction } from '@/app/(app)/settings/actions'

interface DangerZoneProps {
  hasCoupleId: boolean
}

export function DangerZone({ hasCoupleId }: DangerZoneProps) {
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleLeaveCouple(): void {
    setError(null)
    startTransition(async () => {
      const result = await leaveCoupleAction()
      if (result.error) {
        setError(result.error)
      } else {
        setLeaveOpen(false)
      }
    })
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible actions that affect your account and couple
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCoupleId && (
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="font-medium">Leave Couple</p>
              <p className="text-sm text-muted-foreground">
                Remove yourself from this couple. Your shared data (notes,
                check-ins, milestones) will stay with the couple.
              </p>
            </div>
            <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave Couple?</DialogTitle>
                  <DialogDescription>
                    This will remove you from the couple. All shared data
                    (notes, check-ins, milestones, action items) will remain
                    with the couple. You can be re-invited later.
                  </DialogDescription>
                </DialogHeader>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setLeaveOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLeaveCouple}
                    disabled={isPending}
                  >
                    {isPending ? 'Leaving...' : 'Yes, Leave Couple'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all personal data. This
              action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled>
            Delete
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Account deletion is coming soon. Contact support if you need
          immediate assistance.
        </p>
      </CardContent>
    </Card>
  )
}
