'use client'

import { useSessionSettings } from '@/contexts/SessionSettingsContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, Clock } from 'lucide-react'

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

  return (
    <Card className="mb-6 border-pink-200 bg-pink-50 p-4">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-pink-100 p-2">
          <Clock className="h-5 w-5 text-pink-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Session Settings Proposal</h3>
          <p className="mt-1 text-sm text-gray-600">
            Your partner has proposed changes to your check-in session settings. Review and decide whether to accept
            these changes.
          </p>
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
