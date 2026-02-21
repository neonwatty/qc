'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import { getAchievedMilestone } from '@/lib/streaks'
import type { StreakData } from '@/lib/streaks'

interface StreakDisplayProps {
  streakData: StreakData
  className?: string
}

export function StreakDisplay({ streakData, className }: StreakDisplayProps): React.ReactNode {
  const { currentStreak, longestStreak, totalCheckIns } = streakData
  const animatedStreak = useCountUp(currentStreak, 1200)
  const isActive = currentStreak > 0
  const milestone = getAchievedMilestone(currentStreak)

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {/* Flame icon with glow effect */}
        <div
          className={cn(
            'relative flex items-center justify-center h-16 w-16 rounded-full',
            isActive
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/30'
              : 'bg-gray-200 dark:bg-gray-700',
          )}
        >
          <Flame className={cn('h-8 w-8', isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500')} />
          {isActive && <div className="absolute inset-0 rounded-full bg-orange-400/20 animate-pulse" />}
        </div>

        {/* Streak info */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cn('text-3xl font-bold', isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400')}>
              {animatedStreak}
            </span>
            <span className="text-sm text-muted-foreground">{currentStreak === 1 ? 'week' : 'weeks'}</span>
          </div>
          <p className={cn('text-sm font-medium', isActive ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500')}>
            {isActive ? `${currentStreak} week streak!` : 'Start your streak!'}
          </p>
          {milestone && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
              {milestone.emoji} {milestone.label}
            </span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{longestStreak}</div>
          <div className="text-xs text-muted-foreground">Longest Streak</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalCheckIns}</div>
          <div className="text-xs text-muted-foreground">Total Check-ins</div>
        </div>
      </div>
    </div>
  )
}
