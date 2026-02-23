'use client'

import { useActionState, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { toast } from 'sonner'

import { ReminderCard } from '@/components/reminders/ReminderCard'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DbReminder } from '@/types/database'

import { createReminder, deleteReminder, snoozeReminder, toggleReminder, unsnoozeReminder } from './actions'
import type { ReminderActionState } from './actions'

interface Props {
  initialReminders: DbReminder[]
  userId: string
  coupleId: string | null
  partnerId: string | null
}

type ReminderFilter = 'all' | 'active' | 'snoozed' | 'overdue' | 'inactive'

function isReminderOverdue(r: DbReminder): boolean {
  return new Date(r.scheduled_for) < new Date() && r.is_active && !r.is_snoozed
}

function useReminderHandlers(
  reminders: DbReminder[],
  setReminders: React.Dispatch<React.SetStateAction<DbReminder[]>>,
): {
  handleToggle: (id: string, isActive: boolean) => Promise<void>
  handleDelete: (id: string) => Promise<void>
  handleSnooze: (id: string, duration: '15min' | '1hour' | 'tomorrow') => Promise<void>
  handleUnsnooze: (id: string) => Promise<void>
} {
  async function handleToggle(id: string, isActive: boolean): Promise<void> {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: isActive } : r)))
    const result = await toggleReminder(id, isActive)
    if (result.error) {
      toast.error(result.error)
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r)))
    } else {
      toast.success('Reminder updated')
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const prev = reminders
    setReminders((r) => r.filter((rem) => rem.id !== id))
    const result = await deleteReminder(id)
    if (result.error) {
      toast.error(result.error)
      setReminders(prev)
    } else {
      toast.success('Reminder deleted')
    }
  }

  async function handleSnooze(id: string, duration: '15min' | '1hour' | 'tomorrow'): Promise<void> {
    const now = new Date()
    let snoozeUntil: string
    switch (duration) {
      case '15min':
        snoozeUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString()
        break
      case '1hour':
        snoozeUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
        break
      case 'tomorrow': {
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0)
        snoozeUntil = tomorrow.toISOString()
        break
      }
    }
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_snoozed: true, snooze_until: snoozeUntil } : r)))
    const result = await snoozeReminder(id, duration)
    if (result.error) {
      toast.error(result.error)
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_snoozed: false, snooze_until: null } : r)))
    } else {
      toast.success('Reminder snoozed')
    }
  }

  async function handleUnsnooze(id: string): Promise<void> {
    const prev = reminders
    setReminders((r) => r.map((rem) => (rem.id === id ? { ...rem, is_snoozed: false, snooze_until: null } : rem)))
    const result = await unsnoozeReminder(id)
    if (result.error) {
      toast.error(result.error)
      setReminders(prev)
    } else {
      toast.success('Reminder unsnoozed')
    }
  }

  return { handleToggle, handleDelete, handleSnooze, handleUnsnooze }
}

export function RemindersContent({ initialReminders, userId, coupleId, partnerId }: Props): React.ReactElement {
  const [reminders, setReminders] = useState(initialReminders)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<ReminderFilter>('all')
  const [search, setSearch] = useState('')
  const { handleToggle, handleDelete, handleSnooze, handleUnsnooze } = useReminderHandlers(reminders, setReminders)

  const [formState, formAction, isPending] = useActionState<ReminderActionState, FormData>(async (prev, formData) => {
    const result = await createReminder(prev, formData)
    if (result.success && result.reminder) {
      setReminders((r) => [...r, result.reminder!])
      setShowForm(false)
      toast.success('Reminder created')
    }
    if (result.error) {
      toast.error(result.error)
    }
    return result
  }, {})

  const filtered = useMemo(() => {
    let result = reminders.filter((r) => {
      if (filter === 'active') return r.is_active && !r.is_snoozed
      if (filter === 'snoozed') return r.is_snoozed
      if (filter === 'overdue') return isReminderOverdue(r)
      if (filter === 'inactive') return !r.is_active
      return true
    })

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (r) => r.title.toLowerCase().includes(term) || (r.message && r.message.toLowerCase().includes(term)),
      )
    }

    if (filter === 'all' || filter === 'active') {
      result.sort((a, b) => {
        const aOverdue = isReminderOverdue(a)
        const bOverdue = isReminderOverdue(b)
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        return 0
      })
    }

    return result
  }, [reminders, filter, search])

  const reminderButton = <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Reminder'}</Button>

  return (
    <PageContainer title="Reminders" action={reminderButton}>
      {showForm && (
        <ReminderForm
          formAction={formAction}
          formState={formState}
          isPending={isPending}
          coupleId={coupleId}
          userId={userId}
          partnerId={partnerId ?? undefined}
        />
      )}

      <SearchBar value={search} onChange={setSearch} />

      <div className="flex gap-2">
        {(['all', 'active', 'snoozed', 'overdue', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {filter === 'all' && !search
            ? 'No reminders yet. Create one to get started!'
            : search
              ? 'No reminders match your search.'
              : `No ${filter} reminders.`}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              isOwner={reminder.created_by === userId}
              isOverdue={isReminderOverdue(reminder)}
              assigneeName={reminder.assigned_to ? (reminder.assigned_to === userId ? 'You' : 'Partner') : undefined}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onSnooze={handleSnooze}
              onUnsnooze={handleUnsnooze}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }): React.ReactElement {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search reminders..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
