import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { CalendarClock, Bell, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TodayReminder {
  id: string
  title: string
  scheduledFor: string
  category: string
  isOverdue: boolean
}

interface TodayRemindersProps {
  reminders: TodayReminder[]
  className?: string
}

const MAX_VISIBLE = 3

function ReminderItem({ reminder }: { reminder: TodayReminder }): React.ReactNode {
  const time = format(parseISO(reminder.scheduledFor), 'h:mm a')

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
        reminder.isOverdue
          ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
          : 'bg-gray-50 dark:bg-gray-800/50',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          reminder.isOverdue
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
            : 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
        )}
      >
        <Bell className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{reminder.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              'text-xs',
              reminder.isOverdue
                ? 'font-semibold text-amber-600 dark:text-amber-400'
                : 'text-gray-500 dark:text-gray-400',
            )}
          >
            {reminder.isOverdue ? `Overdue \u00b7 ${time}` : time}
          </span>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] capitalize leading-4">
            {reminder.category}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function EmptyState(): React.ReactNode {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <CalendarClock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No reminders today</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enjoy your day, or set up a reminder for later.</p>
    </div>
  )
}

export function TodayReminders({ reminders, className }: TodayRemindersProps): React.ReactNode {
  const visible = reminders.slice(0, MAX_VISIBLE)
  const hasReminders = reminders.length > 0

  return (
    <Card className={cn('bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-pink-500" />
            Today&apos;s Reminders
          </CardTitle>
          {hasReminders && (
            <Link
              href="/reminders"
              className="flex items-center gap-1 text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {hasReminders ? (
          <div className="space-y-2">
            {visible.map((reminder) => (
              <ReminderItem key={reminder.id} reminder={reminder} />
            ))}
            {reminders.length > MAX_VISIBLE && (
              <p className="pt-1 text-center text-xs text-gray-500 dark:text-gray-400">
                +{reminders.length - MAX_VISIBLE} more reminder{reminders.length - MAX_VISIBLE > 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  )
}
