'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

import type { NotificationChannel, ReminderCategory } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CATEGORIES: { key: ReminderCategory; label: string }[] = [
  { key: 'habit', label: 'Habits' },
  { key: 'check-in', label: 'Check-Ins' },
  { key: 'action-item', label: 'Action Items' },
  { key: 'special-date', label: 'Special Dates' },
  { key: 'custom', label: 'Custom Reminders' },
]

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: 'in-app', label: 'In-App Only' },
  { value: 'email', label: 'Email Only' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'None' },
]

type Preferences = Record<ReminderCategory, NotificationChannel>

const DEFAULT_PREFERENCES: Preferences = {
  'habit': 'in-app',
  'check-in': 'both',
  'action-item': 'in-app',
  'special-date': 'both',
  'custom': 'in-app',
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<Preferences>(
    DEFAULT_PREFERENCES,
  )

  function handleChange(
    category: ReminderCategory,
    channel: NotificationChannel,
  ): void {
    setPreferences((prev) => ({ ...prev, [category]: channel }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified for each category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CATEGORIES.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4"
            >
              <Label className="min-w-[120px]">{label}</Label>
              <Select
                value={preferences[key]}
                onValueChange={(value) =>
                  handleChange(key, value as NotificationChannel)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            Notification preferences are stored locally. Push notifications
            require enabling them in your device settings.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
