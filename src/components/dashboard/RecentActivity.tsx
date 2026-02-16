'use client'

import { formatDistanceToNow } from 'date-fns'
import { MessageCircleHeart, StickyNote, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

import { fadeIn } from '@/lib/animations'

type ActivityType = 'check_in' | 'note' | 'milestone'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  createdAt: string
}

interface RecentActivityProps {
  items: ActivityItem[]
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  check_in: {
    icon: <MessageCircleHeart className="h-4 w-4" />,
    color: 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]',
  },
  note: {
    icon: <StickyNote className="h-4 w-4" />,
    color: 'bg-[hsl(var(--secondary)/0.1)] text-[hsl(var(--secondary))]',
  },
  milestone: {
    icon: <Trophy className="h-4 w-4" />,
    color: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]',
  },
}

export function RecentActivity({ items }: RecentActivityProps): React.ReactNode {
  if (items.length === 0) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center"
      >
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          No recent activity yet. Start a check-in or add a note to get started!
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]"
    >
      {items.map((item) => {
        const config = ACTIVITY_CONFIG[item.type]
        return (
          <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 p-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.color}`}>{config.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">{item.title}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

export type { ActivityItem }
