'use client'

import { useState, useCallback } from 'react'

import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import { snakeToCamelObject } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RequestCard } from '@/components/requests/RequestCard'
import { RequestForm } from '@/components/requests/RequestForm'
import type { RelationshipRequest, RequestStatus } from '@/types'
import type { DbRequest } from '@/types/database'

const STATUS_TABS: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'converted', label: 'Converted' },
]

interface Props {
  initialRequests: RelationshipRequest[]
  coupleId: string
  currentUserId: string
  partnerId: string | null
  partnerName: string
}

export function RequestInbox({
  initialRequests,
  coupleId,
  currentUserId,
  partnerId,
  partnerName,
}: Props) {
  const [requests, setRequests] = useState<RelationshipRequest[]>(initialRequests)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleInsert = useCallback((record: Record<string, unknown>) => {
    const request = snakeToCamelObject<RelationshipRequest>(
      record as unknown as Record<string, unknown>,
    )
    setRequests((prev) => [request, ...prev])
  }, [])

  const handleUpdate = useCallback((record: Record<string, unknown>) => {
    const request = snakeToCamelObject<RelationshipRequest>(
      record as unknown as Record<string, unknown>,
    )
    setRequests((prev) => prev.map((r) => (r.id === request.id ? request : r)))
  }, [])

  const handleDelete = useCallback((oldRecord: Record<string, unknown>) => {
    const old = oldRecord as unknown as DbRequest
    setRequests((prev) => prev.filter((r) => r.id !== old.id))
  }, [])

  useRealtimeCouple<Record<string, unknown>>({
    table: 'requests',
    coupleId,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
  })

  const filtered = requests.filter((r) => {
    if (activeTab === 'all') return true
    return r.status === activeTab
  })

  const pendingForMe = requests.filter(
    (r) => r.requestedFor === currentUserId && r.status === 'pending',
  ).length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Requests
            {pendingForMe > 0 && (
              <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {pendingForMe}
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send and manage requests with your partner
          </p>
        </div>
        {partnerId && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Request to {partnerName}</DialogTitle>
              </DialogHeader>
              <RequestForm
                partnerId={partnerId}
                partnerName={partnerName}
                onSuccess={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No {tab.value !== 'all' ? tab.label.toLowerCase() : ''} requests yet.
              </p>
            ) : (
              <div className="grid gap-3">
                {filtered.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
