'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { CheckInCard } from '@/components/dashboard/CheckInCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StreakDisplay } from '@/components/dashboard/StreakDisplay'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { LoveLanguagesWidget } from '@/components/dashboard/LoveLanguagesWidget'
import { PrepBanner } from '@/components/dashboard/PrepBanner'
import { TodayReminders } from '@/components/dashboard/TodayReminders'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import type { StreakData } from '@/lib/streaks'
import type { ActivityItem } from '@/lib/activity'

interface DashboardContentProps {
  checkInCount: number
  noteCount: number
  milestoneCount: number
  actionItemCount: number
  totalLanguages: number
  sharedLanguages: number
  hasCoupleId: boolean
  streakData: StreakData
  activities: ActivityItem[]
  relationshipStartDate: string | null
  lastCheckInDate: string | null
  topLanguages: Array<{ title: string; category: string }>
  todayReminders: Array<{ id: string; title: string; scheduledFor: string; category: string; isOverdue: boolean }>
  pendingRequestCount: number
  partnerTopLanguage: { title: string; category: string } | null
  todayActionCount: number
  frequencyGoal: string | null
}

export function DashboardContent({
  checkInCount,
  noteCount,
  milestoneCount,
  actionItemCount,
  totalLanguages,
  sharedLanguages,
  hasCoupleId,
  streakData,
  activities,
  relationshipStartDate,
  lastCheckInDate,
  topLanguages,
  todayReminders,
  pendingRequestCount,
  partnerTopLanguage,
  todayActionCount,
  frequencyGoal,
}: DashboardContentProps): React.ReactNode {
  const router = useRouter()

  // Revalidate dashboard data when user returns to the page (throttled to once per 30s)
  useEffect(() => {
    let lastRefresh = Date.now()

    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible' && Date.now() - lastRefresh > 30_000) {
        lastRefresh = Date.now()
        router.refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  return (
    <PageContainer title="Dashboard" description="Your relationship command center" className="space-y-8">
      {/* Couple pairing prompt */}
      {!hasCoupleId && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-6 text-center">
          <Heart className="h-8 w-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Connect with your partner</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Invite your partner to start tracking your relationship journey together.
          </p>
          <Link href="/settings">
            <Button>Invite Partner</Button>
          </Link>
        </div>
      )}

      {/* Prep Banner */}
      <PrepBanner lastCheckInDate={lastCheckInDate} />

      {/* Quick Actions */}
      <QuickActions pendingRequests={pendingRequestCount} todayReminders={todayReminders.length} />

      {/* Streak Display */}
      <StreakDisplay streakData={streakData} />

      {/* Check-in Health + Today's Reminders + Recent Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <CheckInCard
          lastCheckInDate={lastCheckInDate}
          totalCheckIns={checkInCount}
          currentStreak={streakData.currentStreak}
          frequencyGoal={frequencyGoal}
        />
        <TodayReminders reminders={todayReminders} />
        <RecentActivity activities={activities} />
      </div>

      {/* Stats + Love Languages Widget */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatsGrid
            checkInCount={checkInCount}
            noteCount={noteCount}
            milestoneCount={milestoneCount}
            actionItemCount={actionItemCount}
            relationshipStartDate={relationshipStartDate}
            lastCheckInDate={lastCheckInDate}
          />
        </div>
        <div className="lg:col-span-1">
          <LoveLanguagesWidget
            totalLanguages={totalLanguages}
            sharedLanguages={sharedLanguages}
            topLanguages={topLanguages}
            partnerTopLanguage={partnerTopLanguage}
            todayActionCount={todayActionCount}
          />
        </div>
      </div>
    </PageContainer>
  )
}
