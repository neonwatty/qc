'use client'

import Link from 'next/link'
import { MessageCircleHeart, StickyNote, TrendingUp, Bell, HandHeart, Languages } from 'lucide-react'
import { motion } from 'framer-motion'

import { staggerContainer, staggerItem } from '@/lib/animations'

interface QuickAction {
  label: string
  description: string
  href: string
  icon: React.ReactNode
  gradient: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Start Check-in',
    description: 'Connect with your partner',
    href: '/checkin',
    icon: <MessageCircleHeart className="h-6 w-6" />,
    gradient: 'gradient-primary',
  },
  {
    label: 'Add Note',
    description: 'Capture a thought or memory',
    href: '/notes',
    icon: <StickyNote className="h-6 w-6" />,
    gradient: 'gradient-warm',
  },
  {
    label: 'Track Growth',
    description: 'View your progress together',
    href: '/growth',
    icon: <TrendingUp className="h-6 w-6" />,
    gradient: 'gradient-soft-coral',
  },
  {
    label: 'Set Reminder',
    description: 'Never forget what matters',
    href: '/reminders',
    icon: <Bell className="h-6 w-6" />,
    gradient: 'gradient-primary',
  },
  {
    label: 'Make a Request',
    description: 'Ask for what you need',
    href: '/requests',
    icon: <HandHeart className="h-6 w-6" />,
    gradient: 'gradient-warm',
  },
  {
    label: 'Love Languages',
    description: 'Understand each other better',
    href: '/love-languages',
    icon: <Languages className="h-6 w-6" />,
    gradient: 'gradient-soft-coral',
  },
]

export function QuickActions(): React.ReactNode {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {QUICK_ACTIONS.map((action) => (
        <motion.div key={action.href} variants={staggerItem}>
          <Link
            href={action.href}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 touch-target sm:p-5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${action.gradient}`}>
              {action.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{action.label}</p>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] hidden sm:block">{action.description}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
