import { formatDistanceToNow, parseISO } from 'date-fns'
import { CheckCircle2, StickyNote, Trophy, ListChecks, HandHeart, Clock } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ActivityItem } from '@/lib/activity'

interface RecentActivityProps {
  activities: ActivityItem[]
  className?: string
}

const ICON_MAP: Record<ActivityItem['type'], React.ReactNode> = {
  'check-in': <CheckCircle2 className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
  milestone: <Trophy className="h-4 w-4" />,
  'action-item': <ListChecks className="h-4 w-4" />,
  request: <HandHeart className="h-4 w-4" />,
}

const COLOR_MAP: Record<ActivityItem['type'], string> = {
  'check-in': 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
  note: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  milestone: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
  'action-item': 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
  request: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400',
}

function ActivityRow({ activity }: { activity: ActivityItem }): React.ReactNode {
  const relativeTime = formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', COLOR_MAP[activity.type])}>
        {ICON_MAP[activity.type]}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {activity.description && (
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">{activity.description}</span>
          )}
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{relativeTime}</span>
        </div>
      </div>
    </div>
  )
}

function EmptyState(): React.ReactNode {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Clock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">No activity yet</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Start a check-in, write a note, or set a milestone to see your journey here.
      </p>
    </div>
  )
}

export function RecentActivity({ activities, className }: RecentActivityProps): React.ReactNode {
  return (
    <Card className={cn('bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-pink-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {activities.map((activity, index) => (
              <ActivityRow key={`${activity.type}-${activity.timestamp}-${index}`} activity={activity} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  )
}
