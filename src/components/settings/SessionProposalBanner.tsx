'use client'

import { useSessionSettings } from '@/contexts/SessionSettingsContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, Clock } from 'lucide-react'

const SETTING_LABELS: Record<string, string> = {
  sessionDuration: 'Session Duration',
  timeoutsPerPartner: 'Timeouts per Partner',
  timeoutDuration: 'Timeout Duration',
  turnBasedMode: 'Turn-based Mode',
  turnDuration: 'Turn Duration',
  allowExtensions: 'Allow Extensions',
  warmUpQuestions: 'Warm-up Questions',
  coolDownTime: 'Cool-down Time',
  pauseNotifications: 'Pause Notifications',
  autoSaveDrafts: 'Auto-save Drafts',
}

export function SessionProposalBanner() {
  const { pendingProposal, respondToProposal } = useSessionSettings()

  if (!pendingProposal) return null

  async function handleAccept() {
    if (pendingProposal) {
      await respondToProposal(pendingProposal.id, true)
    }
  }

  async function handleReject() {
    if (pendingProposal) {
      await respondToProposal(pendingProposal.id, false)
    }
  }

  function formatValue(key: string, value: unknown): string {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (key === 'sessionDuration') return `${value} min`
    if (key === 'turnDuration') return `${value} sec`
    if (key.includes('Duration') || key.includes('Time')) return `${value} min`
    return String(value)
  }

  const proposedChanges = Object.entries(pendingProposal.settings).filter(([key]) => key in SETTING_LABELS)

  return (
    <Card className="mb-6 border-pink-200 bg-pink-50 p-4">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-pink-100 p-2">
          <Clock className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Session Settings Proposal</h3>
          <p className="mt-1 text-sm text-gray-600">
            Your partner has proposed changes to your check-in session settings.
          </p>
          {proposedChanges.length > 0 && (
            <div className="mt-3 rounded-md bg-white p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Proposed Changes</p>
              <ul className="space-y-1 text-sm">
                {proposedChanges.map(([key, value]) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{SETTING_LABELS[key]}:</span>
                    <span className="text-gray-900">{formatValue(key, value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button onClick={handleAccept} size="sm" variant="default">
              <Check className="mr-1 h-4 w-4" />
              Accept
            </Button>
            <Button onClick={handleReject} size="sm" variant="outline">
              <X className="mr-1 h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
