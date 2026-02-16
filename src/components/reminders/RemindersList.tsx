'use client'

import { useState, useCallback } from 'react'

import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import { snakeToCamelObject } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ReminderCard } from '@/components/reminders/ReminderCard'
import { ReminderForm } from '@/components/reminders/ReminderForm'
import type { Reminder, ReminderCategory } from '@/types'
import type { DbReminder } from '@/types/database'

const CATEGORIES: { value: ReminderCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'habit', label: 'Habits' },
  { value: 'check-in', label: 'Check-ins' },
  { value: 'action-item', label: 'Action Items' },
  { value: 'special-date', label: 'Special Dates' },
  { value: 'custom', label: 'Custom' },
]

interface Props {
  initialReminders: Reminder[]
  coupleId: string
  currentUserId: string
}

export function RemindersList({ initialReminders, coupleId, currentUserId }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [showActive, setShowActive] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInsert = useCallback((record: Record<string, unknown>) => {
    const reminder = snakeToCamelObject<Reminder>(record as unknown as Record<string, unknown>)
    setReminders((prev) => [...prev, reminder])
  }, [])

  const handleUpdate = useCallback((record: Record<string, unknown>) => {
    const reminder = snakeToCamelObject<Reminder>(record as unknown as Record<string, unknown>)
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? reminder : r)))
  }, [])

  const handleDelete = useCallback((oldRecord: Record<string, unknown>) => {
    const old = oldRecord as unknown as DbReminder
    setReminders((prev) => prev.filter((r) => r.id !== old.id))
  }, [])

  useRealtimeCouple<Record<string, unknown>>({
    table: 'reminders',
    coupleId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  })

  const filtered = reminders.filter((r) => {
    if (r.isActive !== showActive) return false
    if (activeTab !== 'all' && r.category !== activeTab) return false
    return true
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay on top of what matters in your relationship
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Reminder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
            </DialogHeader>
            <ReminderForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setShowActive(true)}
          className={`text-sm font-medium ${showActive ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'}`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setShowActive(false)}
          className={`text-sm font-medium ${!showActive ? 'text-foreground underline underline-offset-4' : 'text-muted-foreground'}`}
        >
          Inactive
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No {showActive ? 'active' : 'inactive'} reminders
                {cat.value !== 'all' ? ` in ${cat.label.toLowerCase()}` : ''}.
              </p>
            ) : (
              <div className="grid gap-3">
                {filtered.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
