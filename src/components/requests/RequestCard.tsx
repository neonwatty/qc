'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DbRequest } from '@/types/database'

interface Props {
  request: DbRequest
  isReceiver: boolean
  onRespond: (id: string, status: 'accepted' | 'declined') => Promise<void>
  onDelete: (id: string) => Promise<void>
  onConvertToReminder?: (id: string) => Promise<void>
  isConverting?: boolean
}

const PRIORITY_COLORS: Record<DbRequest['priority'], string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const STATUS_COLORS: Record<DbRequest['status'], string> = {
  pending: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
}

const CATEGORY_LABELS: Record<DbRequest['category'], string> = {
  activity: 'Activity',
  task: 'Task',
  reminder: 'Reminder',
  conversation: 'Conversation',
  'date-night': 'Date Night',
  custom: 'Custom',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

export function RequestCard({
  request,
  isReceiver,
  onRespond,
  onDelete,
  onConvertToReminder,
  isConverting = false,
}: Props): React.ReactElement {
  const isPending = request.status === 'pending'
  const isAccepted = request.status === 'accepted'
  const isConverted = request.status === 'converted'
  const canConvert = isAccepted && !isConverted && onConvertToReminder

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{request.title}</h3>
            <Badge variant="secondary" className={STATUS_COLORS[request.status]}>
              {request.status}
            </Badge>
            <Badge variant="secondary" className={PRIORITY_COLORS[request.priority]}>
              {request.priority}
            </Badge>
            {isConverted && request.converted_to_reminder_id && (
              <Badge variant="outline" className="text-xs">
                🔗 Linked to Reminder
              </Badge>
            )}
          </div>

          {request.description && <p className="text-sm text-muted-foreground">{request.description}</p>}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{CATEGORY_LABELS[request.category]}</span>
            {request.suggested_date && (
              <>
                <span>·</span>
                <span>Suggested: {formatDate(request.suggested_date)}</span>
              </>
            )}
            <span>·</span>
            <span>Created {formatDate(request.created_at)}</span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          {isReceiver && isPending && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onRespond(request.id, 'accepted')}>
                Accept
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRespond(request.id, 'declined')}>
                Decline
              </Button>
            </>
          )}
          {canConvert && (
            <Button variant="outline" size="sm" onClick={() => onConvertToReminder(request.id)} disabled={isConverting}>
              {isConverting ? 'Converting...' : 'Convert to Reminder'}
            </Button>
          )}
          {!isReceiver && !isConverted && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(request.id)}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
