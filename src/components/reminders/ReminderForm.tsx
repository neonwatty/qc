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
import { createReminder, updateReminder } from '@/app/(app)/reminders/actions'
import type { Reminder, ReminderCategory, ReminderFrequency, NotificationChannel } from '@/types'

const CATEGORIES: { value: ReminderCategory; label: string }[] = [
  { value: 'habit', label: 'Habit' },
  { value: 'check-in', label: 'Check-in' },
  { value: 'action-item', label: 'Action Item' },
  { value: 'special-date', label: 'Special Date' },
  { value: 'custom', label: 'Custom' },
]

const FREQUENCIES: { value: ReminderFrequency; label: string }[] = [
  { value: 'once', label: 'One time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
]

const CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: 'in-app', label: 'In-app' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'None' },
]

interface Props {
  reminder?: Reminder
  onSuccess?: () => void
}

export function ReminderForm({ reminder, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = reminder
        ? await updateReminder(reminder.id, formData)
        : await createReminder(formData)

      if (!result.error) {
        formRef.current?.reset()
        onSuccess?.()
      }
    })
  }

  const defaultDate = reminder
    ? new Date(reminder.scheduledFor).toISOString().slice(0, 16)
    : ''

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={reminder?.title ?? ''}
          placeholder="e.g. Weekly date night"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          name="message"
          maxLength={2000}
          defaultValue={reminder?.message ?? ''}
          placeholder="Additional details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select name="category" defaultValue={reminder?.category ?? 'habit'}>
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
          <Label>Frequency</Label>
          <Select name="frequency" defaultValue={reminder?.frequency ?? 'weekly'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="scheduledFor">Scheduled For</Label>
          <Input
            id="scheduledFor"
            name="scheduledFor"
            type="datetime-local"
            required
            defaultValue={defaultDate}
          />
        </div>

        <div className="grid gap-2">
          <Label>Notification</Label>
          <Select
            name="notificationChannel"
            defaultValue={reminder?.notificationChannel ?? 'in-app'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNELS.map((ch) => (
                <SelectItem key={ch.value} value={ch.value}>
                  {ch.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? 'Saving...' : reminder ? 'Update Reminder' : 'Create Reminder'}
      </Button>
    </form>
  )
}
