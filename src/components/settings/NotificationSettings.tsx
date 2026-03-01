'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateCoupleSettings } from '@/app/(app)/settings/actions'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, BellRing, Calendar, Clock, Mail } from 'lucide-react'

interface NotificationSettingsProps {
  coupleId: string
}

interface NotificationTypeConfig {
  id: string
  settingKey: string
  name: string
  description: string
  icon: typeof Bell
  defaultEnabled: boolean
}

const NOTIFICATION_TYPES: NotificationTypeConfig[] = [
  {
    id: 'email-notifications',
    settingKey: 'emailNotifications',
    name: 'Check-in Reminders',
    description: 'Get reminders for your scheduled check-ins',
    icon: BellRing,
    defaultEnabled: true,
  },
  {
    id: 'partner-checkins',
    settingKey: 'partnerCheckInNotifications',
    name: 'Partner Check-ins',
    description: 'Notify when your partner completes a check-in',
    icon: Bell,
    defaultEnabled: true,
  },
  {
    id: 'milestone-celebrations',
    settingKey: 'milestoneNotifications',
    name: 'Milestone Celebrations',
    description: 'Celebrate relationship milestones together',
    icon: Calendar,
    defaultEnabled: true,
  },
  {
    id: 'action-items',
    settingKey: 'actionItemNotifications',
    name: 'Action Item Reminders',
    description: 'Get reminded about pending action items',
    icon: Clock,
    defaultEnabled: false,
  },
  {
    id: 'weekly-summary',
    settingKey: 'weeklySummaryNotifications',
    name: 'Weekly Summaries',
    description: 'Receive weekly relationship health summaries',
    icon: Mail,
    defaultEnabled: false,
  },
]

export function NotificationSettings({ coupleId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>({})
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from('couples').select('settings').eq('id', coupleId).single()

      if (error || !data) {
        console.error('Failed to load notification settings:', error)
        return
      }

      const stored = data.settings as Record<string, unknown>
      const loaded: Record<string, boolean> = {}
      for (const nt of NOTIFICATION_TYPES) {
        loaded[nt.settingKey] = stored[nt.settingKey] !== undefined ? stored[nt.settingKey] === true : nt.defaultEnabled
      }
      setSettings(loaded)
      setQuietHoursEnabled(stored.quietHoursEnabled === true)
    }
    loadSettings()
  }, [coupleId, supabase])

  async function handleToggle(settingKey: string, checked: boolean) {
    setSettings((prev) => ({ ...prev, [settingKey]: checked }))
    const result = await updateCoupleSettings(settingKey, checked)
    if (result.error) {
      console.error(`Failed to update ${settingKey}:`, result.error)
    }
  }

  async function handleQuietHoursChange(checked: boolean) {
    setQuietHoursEnabled(checked)
    const result = await updateCoupleSettings('quietHoursEnabled', checked)
    if (result.error) {
      console.error('Failed to update quiet hours:', result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <p className="text-sm text-gray-600">Configure how and when you receive notifications</p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {NOTIFICATION_TYPES.map((nt, index) => {
            const Icon = nt.icon
            return (
              <div key={nt.id} className={index > 0 ? 'border-t pt-4' : ''}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <Label htmlFor={nt.id} className="font-medium">
                        {nt.name}
                      </Label>
                      <p className="text-sm text-gray-600">{nt.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={nt.id}
                    checked={settings[nt.settingKey] ?? nt.defaultEnabled}
                    onCheckedChange={(checked) => handleToggle(nt.settingKey, checked)}
                  />
                </div>
              </div>
            )
          })}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="quiet-hours" className="font-medium">
                    Quiet Hours
                  </Label>
                  <p className="text-sm text-gray-600">Pause notifications during specific times</p>
                </div>
              </div>
              <Switch id="quiet-hours" checked={quietHoursEnabled} onCheckedChange={handleQuietHoursChange} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
