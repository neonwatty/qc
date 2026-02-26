'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ReminderActionState } from '@/app/(app)/reminders/actions'

interface Props {
  formAction: (formData: FormData) => void
  formState: ReminderActionState
  isPending: boolean
  coupleId: string | null
  userId?: string
  partnerId?: string
}

export function ReminderForm({
  formAction,
  formState,
  isPending,
  coupleId,
  userId,
  partnerId,
}: Props): React.ReactElement {
  if (!coupleId) {
    return <p className="text-sm text-muted-foreground">Join a couple first to create reminders.</p>
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">New Reminder</h2>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required maxLength={200} placeholder="e.g., Weekly check-in" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Input id="message" name="message" maxLength={1000} placeholder="Additional details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue="custom"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="habit">Habit</option>
                <option value="check-in">Check-in</option>
                <option value="action-item">Action Item</option>
                <option value="special-date">Special Date</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                name="frequency"
                defaultValue="once"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="once">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_for">Scheduled For</Label>
              <Input id="scheduled_for" name="scheduled_for" type="datetime-local" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_channel">Notification</Label>
              <select
                id="notification_channel"
                name="notification_channel"
                defaultValue="both"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="in-app">In-App</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {userId && partnerId && (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign to</Label>
              <select
                id="assigned_to"
                name="assigned_to"
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Both</option>
                <option value={userId}>Me</option>
                <option value={partnerId}>Partner</option>
              </select>
            </div>
          )}

          {formState.error && <p className="text-sm text-destructive">{formState.error}</p>}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Reminder'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
