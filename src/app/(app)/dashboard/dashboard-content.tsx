'use client'

import Link from 'next/link'
import { Heart, StickyNote, TrendingUp, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { LoveLanguagesWidget } from '@/components/dashboard/LoveLanguagesWidget'

interface DashboardContentProps {
  checkInCount: number
  noteCount: number
  milestoneCount: number
  actionItemCount: number
  totalLanguages: number
  sharedLanguages: number
  hasCoupleId: boolean
}

export function DashboardContent({
  checkInCount,
  noteCount,
  milestoneCount,
  actionItemCount,
  totalLanguages,
  sharedLanguages,
  hasCoupleId,
}: DashboardContentProps): React.ReactNode {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Welcome to Your Dashboard</h1>
        <p className="mt-4 text-lg text-gray-800 dark:text-gray-200 font-medium">Your relationship command center</p>
      </div>

      {/* Couple pairing prompt */}
      {!hasCoupleId && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-6 text-center">
          <Heart className="h-8 w-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Connect with your partner</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Invite your partner to start tracking your relationship journey together.
          </p>
          <Link href="/settings">
            <Button>Invite Partner</Button>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats + Love Languages Widget */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatsGrid
            checkInCount={checkInCount}
            noteCount={noteCount}
            milestoneCount={milestoneCount}
            actionItemCount={actionItemCount}
          />
        </div>
        <div className="lg:col-span-1">
          <LoveLanguagesWidget totalLanguages={totalLanguages} sharedLanguages={sharedLanguages} />
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-200 font-medium">
            <Heart className="h-4 w-4 text-pink-500 mr-2 flex-shrink-0" />
            <span>{checkInCount} check-ins completed</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-200 font-medium">
            <StickyNote className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <span>{noteCount} notes created</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-200 font-medium">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span>{milestoneCount} milestones achieved</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 dark:text-gray-200 font-medium">
            <Bell className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
            <span>{actionItemCount} open action items</span>
          </div>
        </div>
      </div>
    </div>
  )
}
