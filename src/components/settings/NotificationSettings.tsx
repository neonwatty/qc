'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Clock } from 'lucide-react'

interface NotificationSettingsProps {
  coupleId: string
}

export function NotificationSettings({ coupleId }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from('couples').select('settings').eq('id', coupleId).single()

      if (error || !data) {
        console.error('Failed to load notification settings:', error)
        return
      }

      const settings = data.settings as Record<string, unknown>
      setEmailNotifications(settings.emailNotifications !== false)
      setQuietHoursEnabled(settings.quietHoursEnabled === true)
    }
    loadSettings()
  }, [coupleId, supabase])

  async function updateSettings(key: string, value: boolean) {
    const { data: currentData } = await supabase.from('couples').select('settings').eq('id', coupleId).single()

    const currentSettings = (currentData?.settings as Record<string, unknown>) || {}
    const updatedSettings = { ...currentSettings, [key]: value }

    await supabase.from('couples').update({ settings: updatedSettings }).eq('id', coupleId)
  }

  async function handleEmailNotificationsChange(checked: boolean) {
    setEmailNotifications(checked)
    await updateSettings('emailNotifications', checked)
  }

  async function handleQuietHoursChange(checked: boolean) {
    setQuietHoursEnabled(checked)
    await updateSettings('quietHoursEnabled', checked)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <p className="text-sm text-gray-600">Control how and when you receive notifications</p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-gray-600">Receive email updates for reminders and activities</p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="quiet-hours" className="font-medium">
                    Quiet Hours
                  </Label>
                  <p className="text-sm text-gray-600">Pause notifications during specific times (coming soon)</p>
                </div>
              </div>
              <Switch id="quiet-hours" checked={quietHoursEnabled} onCheckedChange={handleQuietHoursChange} disabled />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
