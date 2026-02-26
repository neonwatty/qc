'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateCoupleSettings } from '@/app/(app)/settings/actions'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Lock, Eye } from 'lucide-react'

interface PrivacySettingsProps {
  coupleId: string
}

export function PrivacySettings({ coupleId }: PrivacySettingsProps) {
  const [privateByDefault, setPrivateByDefault] = useState(false)
  const [shareProgress, setShareProgress] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from('couples').select('settings').eq('id', coupleId).single()

      if (error || !data) {
        console.error('Failed to load privacy settings:', error)
        return
      }

      const settings = data.settings as Record<string, unknown>
      setPrivateByDefault(settings.privateByDefault === true)
      setShareProgress(settings.shareProgress !== false)
    }
    loadSettings()
  }, [coupleId, supabase])

  async function handlePrivateByDefaultChange(checked: boolean) {
    setPrivateByDefault(checked)
    const result = await updateCoupleSettings('privateByDefault', checked)
    if (result.error) {
      console.error('Failed to update private by default:', result.error)
    }
  }

  async function handleShareProgressChange(checked: boolean) {
    setShareProgress(checked)
    const result = await updateCoupleSettings('shareProgress', checked)
    if (result.error) {
      console.error('Failed to update share progress:', result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Privacy Settings</h3>
        <p className="text-sm text-gray-600">Control what you share with your partner</p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="private-by-default" className="font-medium">
                  Private by Default
                </Label>
                <p className="text-sm text-gray-600">New notes and love languages start as private</p>
              </div>
            </div>
            <Switch id="private-by-default" checked={privateByDefault} onCheckedChange={handlePrivateByDefaultChange} />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="share-progress" className="font-medium">
                    Share Progress
                  </Label>
                  <p className="text-sm text-gray-600">Show milestones and check-in stats with your partner</p>
                </div>
              </div>
              <Switch id="share-progress" checked={shareProgress} onCheckedChange={handleShareProgressChange} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
