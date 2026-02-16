'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DbReminder } from '@/types/database'

interface Props {
  reminder: DbReminder
  isOwner: boolean
  onToggle: (id: string, isActive: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const CATEGORY_COLORS: Record<DbReminder['category'], string> = {
  habit: 'bg-blue-100 text-blue-800',
  'check-in': 'bg-green-100 text-green-800',
  'action-item': 'bg-orange-100 text-orange-800',
  'special-date': 'bg-pink-100 text-pink-800',
  custom: 'bg-gray-100 text-gray-800',
}

const FREQUENCY_LABELS: Record<DbReminder['frequency'], string> = {
  once: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
}

function formatSchedule(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `In ${diffDays} days`
  return date.toLocaleDateString()
}

export function ReminderCard({ reminder, isOwner, onToggle, onDelete }: Props): React.ReactElement {
  return (
    <Card className={!reminder.is_active ? 'opacity-60' : ''}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-medium ${!reminder.is_active ? 'line-through' : ''}`}>{reminder.title}</h3>
            <Badge variant="secondary" className={CATEGORY_COLORS[reminder.category]}>
              {reminder.category}
            </Badge>
          </div>

          {reminder.message && <p className="text-sm text-muted-foreground">{reminder.message}</p>}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{FREQUENCY_LABELS[reminder.frequency]}</span>
            <span>·</span>
            <span>{formatSchedule(reminder.scheduled_for)}</span>
            <span>·</span>
            <span className="capitalize">{reminder.notification_channel.replace('-', ' ')}</span>
          </div>
        </div>

        {isOwner && (
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={() => onToggle(reminder.id, !reminder.is_active)}>
              {reminder.is_active ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(reminder.id)}>
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
