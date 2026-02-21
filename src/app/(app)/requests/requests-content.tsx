'use client'

import { useActionState, useCallback, useState } from 'react'
import { toast } from 'sonner'

import { RequestCard } from '@/components/requests/RequestCard'
import { RequestForm } from '@/components/requests/RequestForm'
import { Button } from '@/components/ui/button'
import { useRealtimeCouple } from '@/hooks/useRealtimeCouple'
import type { DbRequest } from '@/types/database'

import { createRequest, deleteRequest, respondToRequest } from './actions'
import type { RequestActionState } from './actions'

interface Props {
  initialRequests: DbRequest[]
  userId: string
  coupleId: string | null
  partnerId: string | null
  partnerName: string
}

export function RequestsContent({
  initialRequests,
  userId,
  coupleId,
  partnerId,
  partnerName,
}: Props): React.ReactElement {
  const [requests, setRequests] = useState(initialRequests)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState<'received' | 'sent'>('received')

  const [formState, formAction, isPending] = useActionState<RequestActionState, FormData>(async (prev, formData) => {
    const result = await createRequest(prev, formData)
    if (result.success) {
      setShowForm(false)
      toast.success('Request sent')
    }
    if (result.error) {
      toast.error(result.error)
    }
    return result
  }, {})

  useRealtimeCouple<DbRequest>({
    table: 'requests',
    coupleId,
    onInsert: useCallback((record: DbRequest) => {
      setRequests((prev) => [record, ...prev])
    }, []),
    onUpdate: useCallback((record: DbRequest) => {
      setRequests((prev) => prev.map((r) => (r.id === record.id ? record : r)))
    }, []),
    onDelete: useCallback((old: DbRequest) => {
      setRequests((prev) => prev.filter((r) => r.id !== old.id))
    }, []),
  })

  async function handleRespond(id: string, status: 'accepted' | 'declined'): Promise<void> {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    const result = await respondToRequest(id, status)
    if (result.error) {
      toast.error(result.error)
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'pending' as const } : r)))
    } else {
      toast.success('Response sent')
    }
  }

  async function handleDelete(id: string): Promise<void> {
    const prev = requests
    setRequests((r) => r.filter((req) => req.id !== id))
    const result = await deleteRequest(id)
    if (result.error) {
      toast.error(result.error)
      setRequests(prev)
    } else {
      toast.success('Request deleted')
    }
  }

  const received = requests.filter((r) => r.requested_for === userId)
  const sent = requests.filter((r) => r.requested_by === userId)
  const displayed = tab === 'received' ? received : sent

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Requests</h1>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={() => setShowForm(!showForm)}
            disabled={!partnerId}
            title={!partnerId ? 'Connect with a partner to send requests' : undefined}
          >
            {showForm ? 'Cancel' : 'New Request'}
          </Button>
          {!partnerId && <p className="text-xs text-muted-foreground">Connect with a partner to send requests</p>}
        </div>
      </div>

      {showForm && partnerId && (
        <RequestForm
          formAction={formAction}
          formState={formState}
          isPending={isPending}
          partnerId={partnerId}
          partnerName={partnerName}
        />
      )}

      <div className="flex gap-2">
        {(['received', 'sent'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {t} ({t === 'received' ? received.length : sent.length})
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No {tab} requests yet.{tab === 'sent' && partnerId ? ' Send one to your partner!' : ''}
        </p>
      ) : (
        <div className="space-y-3">
          {displayed.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              isReceiver={request.requested_for === userId}
              onRespond={handleRespond}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
