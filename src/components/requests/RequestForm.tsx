'use client'

import { useTransition, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createRequest } from '@/app/(app)/requests/actions'
import type { RequestCategory, RequestPriority } from '@/types'

const CATEGORIES: { value: RequestCategory; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'task', label: 'Task' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'date-night', label: 'Date Night' },
  { value: 'custom', label: 'Custom' },
]

const PRIORITIES: { value: RequestPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

interface Props {
  partnerId: string
  partnerName: string
  onSuccess?: () => void
}

export function RequestForm({ partnerId, partnerName, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    formData.set('requestedFor', partnerId)

    startTransition(async () => {
      const result = await createRequest(formData)

      if (!result.error) {
        formRef.current?.reset()
        onSuccess?.()
      }
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Plan a weekend hike"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={2000}
          placeholder="More details about the request..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select name="category" defaultValue="activity">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="suggestedDate">Suggested Date (optional)</Label>
        <Input
          id="suggestedDate"
          name="suggestedDate"
          type="date"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        This request will be sent to {partnerName}
      </p>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? 'Sending...' : 'Send Request'}
      </Button>
    </form>
  )
}
