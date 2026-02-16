'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { hapticFeedback } from '@/lib/haptics'
import { ActionSheet } from '@/components/ui/MobileSheetParts'

interface LongPressAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
  onClick: () => void
}

interface LongPressMenuProps {
  children: React.ReactNode
  actions: LongPressAction[]
  className?: string
  disabled?: boolean
  longPressDuration?: number
  rippleEffect?: boolean
  showActionSheet?: boolean
  title?: string
  description?: string
}

interface RippleIndicatorProps {
  position: { x: number; y: number }
  duration: number
}

function RippleIndicator({ position, duration }: RippleIndicatorProps): React.ReactNode {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: duration / 1000 }}
        className="w-8 h-8 bg-gray-400 rounded-full"
      />
    </div>
  )
}

interface PopupMenuProps {
  open: boolean
  actions: LongPressAction[]
  position: { x: number; y: number }
  onClose: () => void
}

function PopupMenu({ open, actions, position, onClose }: PopupMenuProps): React.ReactNode {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 min-w-40 p-1"
            style={{ left: position.x - 80, top: position.y + 20 }}
            initial={{ scale: 0.8, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((action) => (
              <button
                key={action.id}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors',
                  action.variant === 'destructive' ? 'text-red-700 hover:bg-red-50' : 'text-gray-900 hover:bg-gray-100',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                )}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick()
                    onClose()
                  }
                }}
                disabled={action.disabled}
              >
                {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
  children,
  actions,
  className,
  disabled = false,
  longPressDuration = 500,
  rippleEffect = true,
  showActionSheet = true,
  title,
  description,
}) => {
  const [isPressed, setIsPressed] = React.useState(false)
  const [showMenu, setShowMenu] = React.useState(false)
  const [ripplePosition, setRipplePosition] = React.useState({ x: 0, y: 0 })

  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)
  const elementRef = React.useRef<HTMLDivElement>(null)

  const startLongPress = React.useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (disabled) return

      setIsPressed(true)

      if (rippleEffect && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect()
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

        setRipplePosition({ x: clientX - rect.left, y: clientY - rect.top })
      }

      longPressTimer.current = setTimeout(() => {
        hapticFeedback.longPress()
        setShowMenu(true)
        setIsPressed(false)
      }, longPressDuration)
    },
    [disabled, longPressDuration, rippleEffect],
  )

  const cancelLongPress = React.useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsPressed(false)
  }, [])

  const handleTouchStart = React.useCallback(
    (event: React.TouchEvent) => {
      event.preventDefault()
      startLongPress(event)
    },
    [startLongPress],
  )

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      if (event.button === 2) {
        event.preventDefault()
        hapticFeedback.longPress()
        setShowMenu(true)
        return
      }
      startLongPress(event)
    },
    [startLongPress],
  )

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      if (!disabled) {
        hapticFeedback.longPress()
        setShowMenu(true)
      }
    },
    [disabled],
  )

  const closeMenu = () => {
    setShowMenu(false)
  }

  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          'relative overflow-hidden select-none',
          isPressed && 'transform scale-95 transition-transform',
          className,
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        onMouseDown={handleMouseDown}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onContextMenu={handleContextMenu}
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        {children}
        {isPressed && rippleEffect && <RippleIndicator position={ripplePosition} duration={longPressDuration} />}
      </div>

      {showActionSheet ? (
        <ActionSheet open={showMenu} onClose={closeMenu} actions={actions} title={title} description={description} />
      ) : (
        <PopupMenu open={showMenu} actions={actions} position={ripplePosition} onClose={closeMenu} />
      )}
    </>
  )
}

export type { LongPressAction, LongPressMenuProps }
export default LongPressMenu
