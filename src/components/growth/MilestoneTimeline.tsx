'use client'

import { motion } from 'framer-motion'

import { staggerContainer, staggerItem } from '@/lib/animations'
import type { Milestone } from '@/types'
import { MilestoneCard } from '@/components/growth/MilestoneCard'

interface MilestoneTimelineProps {
  milestones: Milestone[]
  onEdit: (milestone: Milestone) => void
}

export function MilestoneTimeline({ milestones, onEdit }: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <span className="text-3xl">🌱</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start tracking your relationship journey by adding your first milestone.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative"
    >
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border sm:left-8" />

      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            variants={staggerItem}
            className="relative pl-14 sm:pl-20"
          >
            {/* Timeline dot */}
            <TimelineDot
              rarity={milestone.rarity}
              icon={milestone.icon}
              index={index}
            />

            {/* Date label */}
            {milestone.achievedAt && (
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                {formatTimelineDate(milestone.achievedAt)}
              </div>
            )}

            <MilestoneCard milestone={milestone} onEdit={onEdit} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

interface TimelineDotProps {
  rarity: string
  icon: string | null
  index: number
}

const RARITY_DOT_COLORS: Record<string, string> = {
  common: 'bg-slate-400 border-slate-300',
  rare: 'bg-blue-500 border-blue-400',
  epic: 'bg-purple-500 border-purple-400',
  legendary: 'bg-amber-500 border-amber-400',
}

function TimelineDot({ rarity, icon, index }: TimelineDotProps) {
  const colorClass = RARITY_DOT_COLORS[rarity] ?? RARITY_DOT_COLORS.common

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 500 }}
      className={`absolute left-3 sm:left-5 flex h-7 w-7 items-center justify-center rounded-full border-2 ${colorClass} text-white text-xs`}
    >
      {icon ?? '✦'}
    </motion.div>
  )
}

function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
