'use client'

import { useTransition } from 'react'
import { Calendar, Check, X, Trash2, ArrowRightLeft } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { updateRequestStatus, deleteRequest } from '@/app/(app)/requests/actions'
import type { RelationshipRequest, RequestPriority } from '@/types'

const PRIORITY_STYLES: Record<RequestPriority, string> = {
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  converted: 'bg-blue-100 text-blue-800',
}

interface Props {
  request: RelationshipRequest
  currentUserId: string
}

export function RequestCard({ request, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition()

  const isRecipient = request.requestedFor === currentUserId
  const isSender = request.requestedBy === currentUserId
  const isPendingStatus = request.status === 'pending'
  const isAccepted = request.status === 'accepted'

  function handleAction(status: string) {
    startTransition(async () => {
      await updateRequestStatus(request.id, status)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteRequest(request.id)
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{request.title}</CardTitle>
            <Badge className={cn('text-xs', STATUS_STYLES[request.status])}>
              {request.status}
            </Badge>
          </div>
          {request.description && (
            <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {isRecipient ? 'For you' : 'From you'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{request.category}</Badge>
          <Badge variant="outline" className={cn(PRIORITY_STYLES[request.priority])}>
            {request.priority}
          </Badge>
          {request.suggestedDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(request.suggestedDate).toLocaleDateString()}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          {isRecipient && isPendingStatus && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAction('accepted')}
                disabled={isPending}
              >
                <Check className="mr-1 h-3.5 w-3.5" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('declined')}
                disabled={isPending}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Decline
              </Button>
            </>
          )}
          {isAccepted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('converted')}
              disabled={isPending}
            >
              <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
              Convert
            </Button>
          )}
          {isSender && isPendingStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
