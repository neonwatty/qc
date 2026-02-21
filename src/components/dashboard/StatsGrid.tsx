'use client'

import { differenceInDays, differenceInMonths, differenceInYears, formatDistanceToNow, parseISO } from 'date-fns'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Flame, BarChart3, Trophy, Target, Calendar, Clock } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value?: number
  displayValue?: string
  suffix?: string
  gradient?: string
}

function StatCard({
  icon,
  label,
  value,
  displayValue,
  suffix = '',
  gradient = 'from-blue-500 to-purple-600',
}: StatCardProps): React.ReactNode {
  const rendered = displayValue ?? String(value ?? 0)

  return (
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5', gradient)} />
      <CardHeader className="pb-3">
        <div className={cn('p-2 rounded-lg bg-gradient-to-br text-white shadow-sm w-fit', gradient)}>{icon}</div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-card-foreground">{rendered}</span>
            {suffix && <span className="text-sm text-muted-foreground font-medium">{suffix}</span>}
          </div>
          <p className="text-sm text-card-foreground font-semibold">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDuration(isoDate: string): string {
  const date = parseISO(isoDate)
  const now = new Date()
  const years = differenceInYears(now, date)
  const months = differenceInMonths(now, date) % 12
  const days = differenceInDays(now, date)

  if (years > 0) {
    return months > 0 ? `${years}y, ${months}mo` : `${years}y`
  }
  if (months > 0) {
    return `${months}mo`
  }
  return `${days}d`
}

function formatLastCheckIn(isoDate: string): string {
  const date = parseISO(isoDate)
  const days = differenceInDays(new Date(), date)

  if (days === 0) return 'Today'
  return formatDistanceToNow(date, { addSuffix: true })
}

interface StatsGridProps {
  checkInCount?: number
  noteCount?: number
  milestoneCount?: number
  actionItemCount?: number
  relationshipStartDate?: string | null
  lastCheckInDate?: string | null
  className?: string
}

export function StatsGrid({
  checkInCount = 0,
  noteCount = 0,
  milestoneCount = 0,
  actionItemCount = 0,
  relationshipStartDate,
  lastCheckInDate,
  className,
}: StatsGridProps): React.ReactNode {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4', className)}>
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
      <StatCard
        icon={<Calendar className="h-4 w-4" />}
        label="Relationship Duration"
        displayValue={relationshipStartDate ? formatDuration(relationshipStartDate) : 'Not set'}
        gradient="from-rose-500 to-pink-500"
      />
      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label="Last Check-in"
        displayValue={lastCheckInDate ? formatLastCheckIn(lastCheckInDate) : 'Never'}
        gradient="from-amber-500 to-yellow-500"
      />
    </div>
  )
}
