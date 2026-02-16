'use client'

import { motion } from 'framer-motion'
import { Award, Flame, Star, TrendingUp } from 'lucide-react'

import { staggerContainer, staggerItem } from '@/lib/animations'
import type { Milestone, MilestoneCategory } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface GrowthStatsProps {
  milestones: Milestone[]
}

const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  relationship: 'Relationship',
  communication: 'Communication',
  intimacy: 'Intimacy',
  growth: 'Growth',
  adventure: 'Adventure',
  milestone: 'Milestone',
  custom: 'Custom',
}

export function GrowthStats({ milestones }: GrowthStatsProps) {
  const totalPoints = milestones.reduce((sum, m) => sum + m.points, 0)
  const totalMilestones = milestones.length

  const categoryBreakdown = milestones.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {})

  const topCategory = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b - a,
  )[0]

  const streakCount = milestones.filter((m) => {
    if (!m.achievedAt) return false
    const date = new Date(m.achievedAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return date >= thirtyDaysAgo
  }).length

  const stats = [
    {
      label: 'Total Milestones',
      value: totalMilestones,
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Points',
      value: totalPoints,
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'This Month',
      value: streakCount,
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Top Category',
      value: topCategory ? CATEGORY_LABELS[topCategory[0] as MilestoneCategory] ?? topCategory[0] : 'N/A',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={staggerItem}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
