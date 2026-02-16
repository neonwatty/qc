'use client'

import { Calendar, MessageCircleHeart, StickyNote, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

import { staggerContainer, staggerItem } from '@/lib/animations'

interface CoupleStatsProps {
  daysTogether: number | null
  checkInsCompleted: number
  milestonesEarned: number
  notesCount: number
}

interface StatCard {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

export function CoupleStats({
  daysTogether,
  checkInsCompleted,
  milestonesEarned,
  notesCount,
}: CoupleStatsProps): React.ReactNode {
  const stats: StatCard[] = [
    {
      label: 'Days Together',
      value: daysTogether !== null ? daysTogether.toLocaleString() : '--',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-[hsl(var(--primary))]',
    },
    {
      label: 'Check-ins',
      value: checkInsCompleted.toLocaleString(),
      icon: <MessageCircleHeart className="h-5 w-5" />,
      color: 'text-[hsl(var(--secondary))]',
    },
    {
      label: 'Milestones',
      value: milestonesEarned.toLocaleString(),
      icon: <Trophy className="h-5 w-5" />,
      color: 'text-[hsl(var(--accent))]',
    },
    {
      label: 'Notes',
      value: notesCount.toLocaleString(),
      icon: <StickyNote className="h-5 w-5" />,
      color: 'text-[hsl(var(--primary))]',
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
        <motion.div
          key={stat.label}
          variants={staggerItem}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
        >
          <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
          <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
