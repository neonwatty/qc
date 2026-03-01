'use client'

import { useState, useCallback } from 'react'
import { Clock, Trash2, Bell, BellOff } from 'lucide-react'

import { toggleReminderActive } from '@/app/(app)/settings/actions/reminders'
import { deleteReminder } from '@/app/(app)/reminders/actions'
import { Button } from '@/components/ui/button'
import type { DbReminder } from '@/types/database'

interface ReminderSchedulerProps {
  reminders: DbReminder[]
  coupleId: string
}

function frequencyLabel(freq: string): string {
  const labels: Record<string, string> = { once: 'One-time', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' }
  return labels[freq] ?? freq
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function ReminderScheduler({ reminders: initial }: ReminderSchedulerProps): React.ReactElement {
  const [reminders, setReminders] = useState(initial)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleToggle = useCallback(async (id: string, isActive: boolean) => {
    setTogglingId(id)
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: isActive } : r)))
    const result = await toggleReminderActive(id, isActive)
    if (result.error) {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r)))
    }
    setTogglingId(null)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    const result = await deleteReminder(id)
    if (!result.error) {
      setReminders((prev) => prev.filter((r) => r.id !== id))
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Reminder Schedule</h3>
        <p className="text-sm text-muted-foreground">Manage your recurring reminders.</p>
      </div>

      {reminders.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No reminders yet. Create one from the Reminders page.
        </p>
      )}

      <div className="space-y-2">
        {reminders.map((r) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-opacity ${
              r.is_active ? 'border-border bg-card' : 'border-border/50 bg-muted/50 opacity-60'
            }`}
          >
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5">{frequencyLabel(r.frequency)}</span>
                <span>{formatTime(r.scheduled_for)}</span>
                <span className="capitalize">{r.notification_channel}</span>
              </div>
            </div>
            <button
              onClick={() => handleToggle(r.id, !r.is_active)}
              disabled={togglingId === r.id}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={r.is_active ? 'Disable reminder' : 'Enable reminder'}
            >
              {r.is_active ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </button>
            {confirmDeleteId === r.id ? (
              <div className="flex gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? '...' : 'Yes'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                  No
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(r.id)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Delete ${r.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
