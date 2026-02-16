'use client'

import { useState, type ReactNode } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ActionCard } from '@/components/love-languages/ActionCard'
import type { LoveAction, LoveActionStatus } from '@/types'

// --- Props ---

interface ActionListProps {
  actions: LoveAction[]
  onEdit?: (action: LoveAction) => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
}

const ALL_VALUE = '_all'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: ALL_VALUE, label: 'All Statuses' },
  { value: 'suggested', label: 'Suggested' },
  { value: 'planned', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'recurring', label: 'Recurring' },
]

export function ActionList({
  actions,
  onEdit,
  onDelete,
  onComplete,
}: ActionListProps): ReactNode {
  const [statusFilter, setStatusFilter] = useState<string>(ALL_VALUE)

  const filtered = actions.filter((action) => {
    if (statusFilter !== ALL_VALUE && action.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg">No love actions found</p>
          <p className="mt-1 text-sm">
            {actions.length > 0
              ? 'Try adjusting your filters'
              : 'Create your first love action to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
