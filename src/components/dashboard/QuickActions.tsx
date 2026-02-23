'use client'

import Link from 'next/link'
import { MessageCircle, StickyNote, TrendingUp, Bell, Heart, HeartHandshake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
  {
    href: '/checkin',
    icon: MessageCircle,
    label: 'Start Check-in',
    description: 'Begin a new relationship check-in session',
    iconColor: 'text-pink-600',
    primary: true,
  },
  {
    href: '/notes',
    icon: StickyNote,
    label: 'View Notes',
    description: 'Review your shared and private notes',
    iconColor: 'text-blue-600',
    primary: false,
  },
  {
    href: '/growth',
    icon: TrendingUp,
    label: 'Growth Gallery',
    description: 'Track your relationship progress',
    iconColor: 'text-green-600',
    primary: false,
  },
  {
    href: '/reminders',
    icon: Bell,
    label: 'Reminders',
    description: 'Manage your personal reminders',
    iconColor: 'text-indigo-600',
    primary: false,
  },
  {
    href: '/love-languages',
    icon: Heart,
    label: 'Love Languages',
    description: 'Express love in meaningful ways',
    iconColor: 'text-red-500',
    primary: false,
  },
  {
    href: '/requests',
    icon: HeartHandshake,
    label: 'Requests',
    description: 'Partner requests and suggestions',
    iconColor: 'text-purple-600',
    primary: false,
  },
] as const

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps): React.ReactNode {
  return (
    <div className={cn('grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <div
            key={action.href}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Icon className={cn('h-8 w-8', action.iconColor)} />
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{action.label}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 font-medium">{action.description}</p>
            <Link href={action.href} className="mt-4 inline-block">
              <Button variant={action.primary ? 'default' : 'outline'} className="w-full">
                {action.label}
              </Button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
