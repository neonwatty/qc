'use client'

import { useActionState, useState } from 'react'

import { ReminderCard } from '@/components/reminders/ReminderCard'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import { Button } from '@/components/ui/button'
import type { DbReminder } from '@/types/database'

import { createReminder, deleteReminder, toggleReminder } from './actions'
import type { ReminderActionState } from './actions'

interface Props {
  initialReminders: DbReminder[]
  userId: string
  coupleId: string | null
}

export function RemindersContent({ initialReminders, userId, coupleId }: Props): React.ReactElement {
  const [reminders, setReminders] = useState(initialReminders)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [formState, formAction, isPending] = useActionState<ReminderActionState, FormData>(async (prev, formData) => {
    const result = await createReminder(prev, formData)
    if (result.success) {
      setShowForm(false)
    }
    return result
  }, {})

  async function handleToggle(id: string, isActive: boolean): Promise<void> {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: isActive } : r)))
    const result = await toggleReminder(id, isActive)
    if (result.error) {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !isActive } : r)))
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const prev = reminders
    setReminders((r) => r.filter((rem) => rem.id !== id))
    const result = await deleteReminder(id)
    if (result.error) {
      setReminders(prev)
    }
  }

  const filtered = reminders.filter((r) => {
    if (filter === 'active') return r.is_active
    if (filter === 'inactive') return !r.is_active
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Reminder'}</Button>
      </div>

      {showForm && (
        <ReminderForm formAction={formAction} formState={formState} isPending={isPending} coupleId={coupleId} />
      )}

      <div className="flex gap-2">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          {filter === 'all' ? 'No reminders yet. Create one to get started!' : `No ${filter} reminders.`}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              isOwner={reminder.created_by === userId}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
