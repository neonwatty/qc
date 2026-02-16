'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import type { MilestoneRarity } from '@/types'

interface RarityBadgeProps {
  rarity: MilestoneRarity
  size?: 'sm' | 'md'
}

const RARITY_CONFIG: Record<
  MilestoneRarity,
  { label: string; className: string; glow: string }
> = {
  common: {
    label: 'Common',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    glow: '',
  },
  rare: {
    label: 'Rare',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    glow: 'shadow-blue-200/50',
  },
  epic: {
    label: 'Epic',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    glow: 'shadow-purple-200/50',
  },
  legendary: {
    label: 'Legendary',
    className: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300',
    glow: 'shadow-amber-200/50 shadow-md',
  },
}

export function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity]

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        config.glow,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      )}
    >
      {rarity === 'legendary' && (
        <span className="mr-0.5" aria-hidden="true">
          ✦
        </span>
      )}
      {config.label}
    </motion.span>
  )
}
