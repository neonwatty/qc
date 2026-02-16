'use client'

import * as React from 'react'

import { hapticFeedback } from '@/lib/haptics'
import { LongPressMenu } from '@/components/ui/LongPressMenu'
import type { LongPressAction, LongPressMenuProps } from '@/components/ui/LongPressMenu'

export function useLongPress(
  callback: () => void,
  options?: {
    duration?: number
    disabled?: boolean
  },
) {
  const { duration = 500, disabled = false } = options || {}
  const timer = React.useRef<NodeJS.Timeout | null>(null)

  const start = React.useCallback(() => {
    if (disabled) return

    timer.current = setTimeout(() => {
      hapticFeedback.longPress()
      callback()
    }, duration)
  }, [callback, duration, disabled])

  const cancel = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      if (timer.current) { clearTimeout(timer.current) }
    }
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
  }
}

interface LongPressCardProps extends Omit<LongPressMenuProps, 'actions'> {
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onDuplicate?: () => void
  customActions?: LongPressAction[]
}

export const LongPressCard: React.FC<LongPressCardProps> = ({
  children,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
  customActions = [],
  ...props
}) => {
  const defaultActions: LongPressAction[] = []

  if (onEdit) {
    defaultActions.push({ id: 'edit', label: 'Edit', onClick: onEdit })
  }

  if (onShare) {
    defaultActions.push({ id: 'share', label: 'Share', onClick: onShare })
  }

  if (onDuplicate) {
    defaultActions.push({ id: 'duplicate', label: 'Duplicate', onClick: onDuplicate })
  }

  if (onDelete) {
    defaultActions.push({ id: 'delete', label: 'Delete', variant: 'destructive', onClick: onDelete })
  }

  const actions = [...defaultActions, ...customActions]

  return (
    <LongPressMenu actions={actions} {...props}>
      {children}
    </LongPressMenu>
  )
}
