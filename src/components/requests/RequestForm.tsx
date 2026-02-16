'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { RequestActionState } from '@/app/(app)/requests/actions'

interface Props {
  formAction: (formData: FormData) => void
  formState: RequestActionState
  isPending: boolean
  partnerId: string
  partnerName: string
}

export function RequestForm({ formAction, formState, isPending, partnerId, partnerName }: Props): React.ReactElement {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">New Request for {partnerName}</h2>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="requested_for" value={partnerId} />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required maxLength={200} placeholder="e.g., Plan a date night" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              name="description"
              maxLength={2000}
              placeholder="What would you like to do together?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue="activity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="activity">Activity</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="conversation">Conversation</option>
                <option value="date-night">Date Night</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggested_date">Suggested Date (optional)</Label>
            <Input id="suggested_date" name="suggested_date" type="date" />
          </div>

          {formState.error && <p className="text-sm text-destructive">{formState.error}</p>}

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Sending...' : 'Send Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
