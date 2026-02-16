'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO, isThisYear } from 'date-fns'
import {
  Award,
  CheckCircle,
  Clock,
  Trophy,
  Target,
  Heart,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Milestone, MilestoneCategory, MilestoneRarity } from '@/types'

interface MilestoneCardProps {
  milestone: Milestone
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  className?: string
  onClick?: (milestone: Milestone) => void
}

const CATEGORY_CONFIG: Record<
  MilestoneCategory,
  {
    color: string
    bgColor: string
    borderColor: string
    gradientFrom: string
    gradientTo: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  communication: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    icon: Users,
  },
  intimacy: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-red-600',
    icon: Heart,
  },
  growth: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600',
    icon: TrendingUp,
  },
  relationship: {
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-pink-600',
    icon: Trophy,
  },
  adventure: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    icon: CheckCircle,
  },
  milestone: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-indigo-600',
    icon: Target,
  },
  custom: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    gradientFrom: 'from-gray-500',
    gradientTo: 'to-gray-600',
    icon: Award,
  },
}

const RARITY_CONFIG: Record<MilestoneRarity, { borderColor: string; badgeColor: string }> = {
  common: { borderColor: 'border-gray-300', badgeColor: 'bg-gray-100 text-gray-700' },
  rare: { borderColor: 'border-blue-300', badgeColor: 'bg-blue-100 text-blue-700' },
  epic: { borderColor: 'border-purple-300', badgeColor: 'bg-purple-100 text-purple-700' },
  legendary: { borderColor: 'border-yellow-300', badgeColor: 'bg-yellow-100 text-yellow-700' },
}

function formatMilestoneDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isThisYear(date)) {
    return format(date, 'MMM d')
  }
  return format(date, 'MMM d, yyyy')
}

export function MilestoneCard({
  milestone,
  variant = 'default',
  showActions = true,
  className,
  onClick,
}: MilestoneCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)

  const config = CATEGORY_CONFIG[milestone.category]
  const rarityConf = RARITY_CONFIG[milestone.rarity]
  const CategoryIcon = config.icon
  const isAchieved = milestone.achievedAt !== null

  function handleClick(): void {
    if (onClick) {
      onClick(milestone)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 transition-all duration-200 dark:bg-gray-900',
          'hover:border-gray-300 hover:shadow-md',
          config.borderColor,
          className,
        )}
        whileHover={{ y: -1 }}
        onClick={handleClick}
      >
        <div className={cn('flex-shrink-0 rounded-lg p-2', config.bgColor)}>
          {milestone.icon ? (
            <span className="text-lg">{milestone.icon}</span>
          ) : (
            <CategoryIcon className={cn('h-5 w-5', config.color)} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{milestone.title}</h3>
          <p className="truncate text-xs text-gray-600 dark:text-gray-400">{milestone.description}</p>
        </div>

        <div className="flex-shrink-0 text-right">
          {isAchieved ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">{formatMilestoneDate(milestone.achievedAt!)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Upcoming</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        className={cn(
          'cursor-pointer overflow-hidden rounded-xl border-2 bg-white shadow-lg transition-all dark:bg-gray-900',
          rarityConf.borderColor,
          className,
        )}
        whileHover={{ y: -4, scale: 1.01 }}
        onClick={handleClick}
      >
        {milestone.photoUrl && (
          <div className="relative h-40 w-full">
            <img src={milestone.photoUrl} alt={milestone.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className={cn('rounded-full px-2 py-1 text-xs font-medium', rarityConf.badgeColor)}>
                {milestone.rarity}
              </span>
            </div>
          </div>
        )}

        <div className="p-5">
          <div className="mb-3 flex items-start gap-3">
            <div className={cn('rounded-lg p-2', config.bgColor)}>
              {milestone.icon ? (
                <span className="text-xl">{milestone.icon}</span>
              ) : (
                <CategoryIcon className={cn('h-6 w-6', config.color)} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{milestone.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className={cn('capitalize', config.color)}>{milestone.category}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{milestone.points} pts</span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn(
        'cursor-pointer rounded-lg border bg-white p-5 shadow-sm transition-all duration-200 dark:bg-gray-900',
        'hover:border-gray-300 hover:shadow-md',
        config.borderColor,
        className,
      )}
      whileHover={{ y: -2 }}
      onClick={handleClick}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn('flex-shrink-0 rounded-lg p-2', config.bgColor)}>
            {milestone.icon ? (
              <span className="text-xl">{milestone.icon}</span>
            ) : (
              <CategoryIcon className={cn('h-6 w-6', config.color)} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{milestone.title}</h3>
              {isAchieved && <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />}
            </div>

            {milestone.category && (
              <div className="mb-2 flex items-center gap-2">
                <span className={cn('text-xs capitalize', config.color)}>{milestone.category}</span>
                {milestone.rarity !== 'common' && (
                  <span className={cn('rounded-full px-1.5 py-0.5 text-xs', rarityConf.badgeColor)}>
                    {milestone.rarity}
                  </span>
                )}
              </div>
            )}

            <p
              className={cn('text-sm leading-relaxed text-gray-600 dark:text-gray-400', !isExpanded && 'line-clamp-2')}
            >
              {milestone.description}
            </p>
          </div>
        </div>

        {showActions && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {isAchieved && milestone.achievedAt && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {formatMilestoneDate(milestone.achievedAt)}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          {milestone.points} pts
        </div>
      </div>
    </motion.div>
  )
}
