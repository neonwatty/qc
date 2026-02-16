'use client'

import type { ReactNode } from 'react'
import { CheckCircle2, Clock, Sparkles, Repeat, Pencil, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { LoveAction } from '@/types'

// --- Status config ---

const STATUS_CONFIG: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  suggested: { icon: Sparkles, label: 'Suggested', color: 'bg-purple-100 text-purple-700' },
  planned: { icon: Clock, label: 'Planned', color: 'bg-blue-100 text-blue-700' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'bg-green-100 text-green-700' },
  recurring: { icon: Repeat, label: 'Recurring', color: 'bg-amber-100 text-amber-700' },
}

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'One-time',
  weekly: 'Weekly',
  monthly: 'Monthly',
  surprise: 'Surprise',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-50 text-green-700',
  moderate: 'bg-yellow-50 text-yellow-700',
  challenging: 'bg-red-50 text-red-700',
}

// --- Props ---

interface ActionCardProps {
  action: LoveAction
  onEdit?: (action: LoveAction) => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
}

export function ActionCard({
  action,
  onEdit,
  onDelete,
  onComplete,
}: ActionCardProps): ReactNode {
  const statusCfg = STATUS_CONFIG[action.status] ?? STATUS_CONFIG.suggested
  const StatusIcon = statusCfg.icon
  const frequencyLabel = FREQUENCY_LABELS[action.frequency] ?? action.frequency
  const difficultyColor = DIFFICULTY_COLORS[action.difficulty] ?? DIFFICULTY_COLORS.easy

  return (
    <Card variant="elevated" className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{action.title}</CardTitle>

          <Badge className={cn('gap-1 text-xs', statusCfg.color)}>
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">
            {frequencyLabel}
          </Badge>
          <Badge className={cn('text-xs', difficultyColor)}>
            {action.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {action.description && (
          <p className="mb-3 text-sm text-muted-foreground">{action.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Completed: {action.completedCount}x</span>
          {action.lastCompletedAt && (
            <span>
              Last: {new Date(action.lastCompletedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {onComplete && action.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onComplete(action.id)}
              className="gap-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Complete
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(action)}
              className="gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(action.id)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
