'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle, ChevronDown, ChevronRight, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CATEGORY_CONFIG, RARITY_CONFIG, formatMilestoneDate } from './milestone-card-config'
import type { CategoryConfig } from './milestone-card-config'
import type { Milestone, MilestoneRarity } from '@/types'

interface MilestoneCardProps {
  milestone: Milestone
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  className?: string
  onClick?: (milestone: Milestone) => void
}

interface MilestoneIconProps {
  icon: string | null
  CategoryIcon: React.ComponentType<{ className?: string }>
  config: CategoryConfig
  size?: 'sm' | 'md'
}

function MilestoneIcon({ icon, CategoryIcon, config, size = 'md' }: MilestoneIconProps): React.ReactElement {
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl'
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'

  return icon ? <span className={textSize}>{icon}</span> : <CategoryIcon className={cn(iconSize, config.color)} />
}

interface RarityBadgeProps {
  rarity: MilestoneRarity
  borderColor: string
  badgeColor: string
}

function RarityBadge({ rarity, badgeColor }: RarityBadgeProps): React.ReactElement {
  return <span className={cn('rounded-full px-2 py-1 text-xs font-medium', badgeColor)}>{rarity}</span>
}

function CompactVariant({
  milestone,
  config,
  isAchieved,
  className,
  onClick,
}: {
  milestone: Milestone
  config: CategoryConfig
  isAchieved: boolean
  className?: string
  onClick: () => void
}): React.ReactElement {
  return (
    <motion.div
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border bg-white p-3 transition-all duration-200 dark:bg-gray-900',
        'hover:border-gray-300 hover:shadow-md',
        config.borderColor,
        className,
      )}
      whileHover={{ y: -1 }}
      onClick={onClick}
    >
      <div className={cn('flex-shrink-0 rounded-lg p-2', config.bgColor)}>
        <MilestoneIcon icon={milestone.icon} CategoryIcon={config.icon} config={config} size="sm" />
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

function FeaturedVariant({
  milestone,
  config,
  rarityConf,
  className,
  onClick,
}: {
  milestone: Milestone
  config: CategoryConfig
  rarityConf: { borderColor: string; badgeColor: string }
  className?: string
  onClick: () => void
}): React.ReactElement {
  return (
    <motion.div
      className={cn(
        'cursor-pointer overflow-hidden rounded-lg border-2 bg-white shadow-lg transition-all dark:bg-gray-900',
        rarityConf.borderColor,
        className,
      )}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
    >
      {milestone.photoUrl && (
        <div className="relative h-40 w-full">
          <img src={milestone.photoUrl} alt={milestone.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <RarityBadge
              rarity={milestone.rarity}
              borderColor={rarityConf.borderColor}
              badgeColor={rarityConf.badgeColor}
            />
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className={cn('rounded-lg p-2', config.bgColor)}>
            <MilestoneIcon icon={milestone.icon} CategoryIcon={config.icon} config={config} />
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
      <CompactVariant
        milestone={milestone}
        config={config}
        isAchieved={isAchieved}
        className={className}
        onClick={handleClick}
      />
    )
  }

  if (variant === 'featured') {
    return (
      <FeaturedVariant
        milestone={milestone}
        config={config}
        rarityConf={rarityConf}
        className={className}
        onClick={handleClick}
      />
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
        <div className="flex flex-1 items-start gap-3">
          <div className={cn('flex-shrink-0 rounded-lg p-2', config.bgColor)}>
            <MilestoneIcon icon={milestone.icon} CategoryIcon={config.icon} config={config} />
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
