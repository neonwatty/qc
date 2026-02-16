'use client'

import { useTransition, useState } from 'react'
import { Bell, BellOff, Calendar, Clock, Mail, Trash2, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import { toggleActive, deleteReminder } from '@/app/(app)/reminders/actions'
import type { Reminder, NotificationChannel } from '@/types'

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'One time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
}

function channelIcon(channel: NotificationChannel) {
  switch (channel) {
    case 'email':
      return <Mail className="h-3.5 w-3.5" />
    case 'both':
      return <Bell className="h-3.5 w-3.5" />
    case 'none':
      return <BellOff className="h-3.5 w-3.5" />
    default:
      return <Bell className="h-3.5 w-3.5" />
  }
}

interface Props {
  reminder: Reminder
  currentUserId: string
}

export function ReminderCard({ reminder, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)

  const isOwner = reminder.createdBy === currentUserId
  const scheduledDate = new Date(reminder.scheduledFor)
  const isPast = scheduledDate < new Date()

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      await toggleActive(reminder.id, checked)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteReminder(reminder.id)
    })
  }

  return (
    <>
      <Card className={cn(!reminder.isActive && 'opacity-60')}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-base">{reminder.title}</CardTitle>
            {reminder.message && (
              <p className="mt-1 text-sm text-muted-foreground">{reminder.message}</p>
            )}
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Switch
                checked={reminder.isActive}
                onCheckedChange={handleToggle}
                disabled={isPending}
                aria-label="Toggle active"
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{reminder.category}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {FREQUENCY_LABELS[reminder.frequency] ?? reminder.frequency}
            </Badge>
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1', isPast && 'border-destructive text-destructive')}
            >
              <Calendar className="h-3 w-3" />
              {scheduledDate.toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {channelIcon(reminder.notificationChannel)}
              {reminder.notificationChannel}
            </Badge>
          </div>
          {isOwner && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                disabled={isPending}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
          </DialogHeader>
          <ReminderForm
            reminder={reminder}
            onSuccess={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
