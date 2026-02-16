import { Award, CheckCircle, Heart, Target, Trophy, TrendingUp, Users } from 'lucide-react'
import { format, isThisYear, parseISO } from 'date-fns'

import type { MilestoneCategory, MilestoneRarity } from '@/types'

export interface CategoryConfig {
  color: string
  bgColor: string
  borderColor: string
  gradientFrom: string
  gradientTo: string
  icon: React.ComponentType<{ className?: string }>
}

export const CATEGORY_CONFIG: Record<MilestoneCategory, CategoryConfig> = {
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

export const RARITY_CONFIG: Record<MilestoneRarity, { borderColor: string; badgeColor: string }> = {
  common: { borderColor: 'border-gray-300', badgeColor: 'bg-gray-100 text-gray-700' },
  rare: { borderColor: 'border-blue-300', badgeColor: 'bg-blue-100 text-blue-700' },
  epic: { borderColor: 'border-purple-300', badgeColor: 'bg-purple-100 text-purple-700' },
  legendary: { borderColor: 'border-yellow-300', badgeColor: 'bg-yellow-100 text-yellow-700' },
}

export function formatMilestoneDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isThisYear(date)) {
    return format(date, 'MMM d')
  }
  return format(date, 'MMM d, yyyy')
}
