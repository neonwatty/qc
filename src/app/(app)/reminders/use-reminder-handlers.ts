import { toast } from 'sonner'

import type { DbReminder } from '@/types/database'

import { deleteReminder, snoozeReminder, toggleReminder, unsnoozeReminder } from './actions'

export function useReminderHandlers(
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
