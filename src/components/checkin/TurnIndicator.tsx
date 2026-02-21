'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, Plus, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTurnState } from '@/hooks/useTurnState'
import { useSessionSettings } from '@/contexts/SessionSettingsContext'
import { hapticFeedback } from '@/lib/haptics'
import { SPRING_CONFIGS } from '@/lib/animations'
import { Button } from '@/components/ui/button'

interface Props {
  /** Display name for the current user */
  userName?: string
  /** Display name for the partner */
  partnerName?: string
  /** Called when the turn switches (manual or auto) */
  onTurnSwitch?: (newTurn: 'user' | 'partner') => void
  /** Additional class names */
  className?: string
}

function getInitial(name: string | undefined): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

export function TurnIndicator({
  userName = 'You',
  partnerName = 'Partner',
  onTurnSwitch,
  className,
}: Props): React.ReactNode {
  const { getActiveSettings } = useSessionSettings()
  const settings = getActiveSettings()

  const {
    currentTurn,
    switchTurn,
    formattedTurnTime,
    turnTimeRemaining,
    isActive,
    extendTurn,
    extensionsUsed,
    maxExtensions,
  } = useTurnState({
    turnDuration: settings.turnDuration,
    enabled: settings.turnBasedMode,
    allowExtensions: settings.allowExtensions,
    onTurnSwitch: (newTurn) => {
      hapticFeedback.toggle()
      onTurnSwitch?.(newTurn)
    },
  })

  if (!isActive) return null

  const isUserTurn = currentTurn === 'user'
  const isLowTime = turnTimeRemaining <= 15
  const totalDuration = settings.turnDuration + extensionsUsed * 60

  function handlePassTurn(): void {
    hapticFeedback.tap()
    switchTurn()
  }

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-2.5',
        'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'ring-1 ring-gray-200 dark:ring-gray-700',
        'shadow-sm',
        className,
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIGS.snappy}
    >
      {/* User avatar */}
      <AvatarCircle name={userName} isActive={isUserTurn} label="You" />

      {/* Center: timer + pass button */}
      <div className="flex flex-col items-center gap-1">
        {/* Turn timer */}
        <div className="flex items-center gap-1.5">
          <Timer className={cn('h-3.5 w-3.5', isLowTime ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')} />
          <AnimatePresence mode="wait">
            <motion.span
              key={formattedTurnTime}
              className={cn(
                'font-mono text-sm font-semibold tabular-nums',
                isLowTime ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
              )}
              initial={{ opacity: 0, y: -4 }}
              animate={
                isLowTime
                  ? {
                      opacity: [1, 0.4, 1],
                      y: 0,
                      transition: {
                        opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                        y: { duration: 0.15 },
                      },
                    }
                  : { opacity: 1, y: 0 }
              }
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {formattedTurnTime}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isLowTime ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-purple-500',
            )}
            initial={false}
            animate={{ width: `${totalDuration > 0 ? (turnTimeRemaining / totalDuration) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </div>

        {/* Pass turn button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePassTurn}
          className="h-7 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowRightLeft className="mr-1 h-3 w-3" />
          Pass Turn
        </Button>

        {/* Extend turn button */}
        {settings.allowExtensions && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              hapticFeedback.tap()
              extendTurn()
            }}
            disabled={extensionsUsed >= maxExtensions}
            className="h-7 px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40"
          >
            <Plus className="mr-1 h-3 w-3" />
            +1 min {extensionsUsed > 0 && `(${extensionsUsed}/${maxExtensions})`}
          </Button>
        )}
      </div>

      {/* Partner avatar */}
      <AvatarCircle name={partnerName} isActive={!isUserTurn} label={partnerName} />
    </motion.div>
  )
}

// --- Avatar Circle Sub-Component ---

interface AvatarCircleProps {
  name: string
  isActive: boolean
  label: string
}

function AvatarCircle({ name, isActive, label }: AvatarCircleProps): React.ReactNode {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors',
          isActive
            ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
        )}
        animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={isActive ? { duration: 0.4, ease: 'easeInOut' } : { duration: 0.2 }}
      >
        {/* Gradient ring for active turn */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-[-3px] rounded-full bg-gradient-to-br from-pink-400 to-purple-500 opacity-40"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{ zIndex: -1 }}
            />
          )}
        </AnimatePresence>
        {getInitial(name)}
      </motion.div>
      <span
        className={cn(
          'text-[10px] font-medium leading-none',
          isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500',
        )}
      >
        {label}
      </span>
    </div>
  )
}
