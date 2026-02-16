'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Flame, BarChart3, Trophy, Target } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  gradient?: string
}

function StatCard({
  icon,
  label,
  value,
  suffix = '',
  gradient = 'from-blue-500 to-purple-600',
}: StatCardProps): React.ReactNode {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', gradient)} />
      <CardHeader className="pb-3">
        <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white shadow-sm w-fit', gradient)}>{icon}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            {suffix && <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{suffix}</span>}
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  checkInCount?: number
  noteCount?: number
  milestoneCount?: number
  actionItemCount?: number
  className?: string
}

export function StatsGrid({
  checkInCount = 0,
  noteCount = 0,
  milestoneCount = 0,
  actionItemCount = 0,
  className,
}: StatsGridProps): React.ReactNode {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4', className)}>
      <StatCard
        icon={<Flame className="h-4 w-4" />}
        label="Check-ins"
        value={checkInCount}
        gradient="from-orange-500 to-red-500"
      />
      <StatCard
        icon={<BarChart3 className="h-4 w-4" />}
        label="Notes"
        value={noteCount}
        gradient="from-green-500 to-emerald-600"
      />
      <StatCard
        icon={<Trophy className="h-4 w-4" />}
        label="Milestones"
        value={milestoneCount}
        gradient="from-purple-500 to-pink-600"
      />
      <StatCard
        icon={<Target className="h-4 w-4" />}
        label="Action Items"
        value={actionItemCount}
        gradient="from-blue-500 to-cyan-600"
      />
    </div>
  )
}
