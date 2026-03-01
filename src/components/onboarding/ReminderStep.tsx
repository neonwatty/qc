'use client'

import { useState } from 'react'
import { Bell, Calendar, Clock, Heart } from 'lucide-react'

type ReminderStepProps = {
  reminderDay: string
  reminderTime: string
  onUpdate: (day: string, time: string) => void
  onNext: () => void
  onBack: () => void
}

const DAYS = [
  { value: 'monday', short: 'M', label: 'Mon' },
  { value: 'tuesday', short: 'T', label: 'Tue' },
  { value: 'wednesday', short: 'W', label: 'Wed' },
  { value: 'thursday', short: 'T', label: 'Thu' },
  { value: 'friday', short: 'F', label: 'Fri' },
  { value: 'saturday', short: 'S', label: 'Sat' },
  { value: 'sunday', short: 'S', label: 'Sun' },
]

const TIMES = [
  { value: '09:00', label: '9:00 AM', emoji: '☀️' },
  { value: '12:00', label: '12:00 PM', emoji: '🌞' },
  { value: '18:00', label: '6:00 PM', emoji: '🌅' },
  { value: '20:00', label: '8:00 PM', emoji: '🌙' },
]

function getDayLabel(day: string): string {
  return DAYS.find((d) => d.value === day)?.label ?? day
}

function getTimeLabel(time: string): string {
  return TIMES.find((t) => t.value === time)?.label ?? time
}

export function ReminderStep({ reminderDay, reminderTime, onUpdate, onNext, onBack }: ReminderStepProps) {
  const [showPreview, setShowPreview] = useState(false)

  function handleDaySelect(day: string) {
    onUpdate(day, reminderTime)
  }

  function handleTimeSelect(time: string) {
    onUpdate(reminderDay, time)
  }

  function handlePreview() {
    setShowPreview(true)
    setTimeout(() => setShowPreview(false), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
          <Bell className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold">Set Your First Reminder</h2>
        <p className="text-sm text-muted-foreground">When should we remind you to check in?</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <Calendar className="h-3.5 w-3.5" />
            Choose a day
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDaySelect(day.value)}
                className={`rounded-lg border-2 p-2 text-center transition-all ${
                  reminderDay === day.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-border hover:border-indigo-300'
                }`}
              >
                <div className="text-xs font-medium">{day.short}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            Pick a time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIMES.map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => handleTimeSelect(time.value)}
                className={`rounded-lg border-2 p-3 transition-all ${
                  reminderTime === time.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-border hover:border-indigo-300'
                }`}
              >
                <div className="text-lg">{time.emoji}</div>
                <div className="text-sm font-medium">{time.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 dark:border-indigo-800 dark:from-indigo-900/20 dark:to-purple-900/20">
          <div className="flex items-start gap-2">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-medium">Reminder Preview</p>
              <p className="text-xs text-muted-foreground">
                Every {getDayLabel(reminderDay)} at {getTimeLabel(reminderTime)}
              </p>
              <p className="mt-1 text-xs text-pink-600 dark:text-pink-400">&ldquo;Time for your check-in! 💕&rdquo;</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <Heart className="mr-1 inline h-3.5 w-3.5 text-pink-500" />
          You can add more reminders and customize notifications later in Settings
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="touch-target flex-1 rounded-xl border border-border px-4 py-3 font-semibold transition-colors hover:bg-muted"
        >
          Back
        </button>
        {!showPreview && (
          <button
            type="button"
            onClick={handlePreview}
            className="touch-target rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Preview
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          className="touch-target gradient-primary flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
