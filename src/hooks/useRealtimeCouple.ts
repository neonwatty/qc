'use client'

import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

type RealtimeTable =
  | 'notes'
  | 'check_ins'
  | 'action_items'
  | 'requests'
  | 'love_languages'
  | 'love_actions'
  | 'categories'
  | 'session_settings_proposals'
  | 'love_language_discoveries'
  | 'reminders'
  | 'milestones'

interface UseRealtimeCoupleOptions<T = Record<string, unknown>> {
  table: RealtimeTable
  coupleId: string | null
  onInsert?: (record: T) => void
  onUpdate?: (record: T) => void
  onDelete?: (oldRecord: T) => void
}

export function useRealtimeCouple<T>({
  table,
  coupleId,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeCoupleOptions<T>): void {
  const onInsertRef = useRef(onInsert)
  const onUpdateRef = useRef(onUpdate)
  const onDeleteRef = useRef(onDelete)

  useEffect(() => {
    onInsertRef.current = onInsert
    onUpdateRef.current = onUpdate
    onDeleteRef.current = onDelete
  }, [onInsert, onUpdate, onDelete])

  useEffect(() => {
    if (!coupleId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`${table}:couple:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (payload.eventType === 'INSERT' && onInsertRef.current) {
            onInsertRef.current(payload.new as T)
          } else if (payload.eventType === 'UPDATE' && onUpdateRef.current) {
            onUpdateRef.current(payload.new as T)
          } else if (payload.eventType === 'DELETE' && onDeleteRef.current) {
            onDeleteRef.current(payload.old as T)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, coupleId])
}
