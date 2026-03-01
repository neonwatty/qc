'use client'

import Link from 'next/link'
import { Heart, Plus, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface TopLanguage {
  title: string
  category: string
}

interface LoveLanguagesWidgetProps {
  totalLanguages?: number
  sharedLanguages?: number
  completedThisWeek?: number
  topLanguages?: TopLanguage[]
  partnerTopLanguage?: TopLanguage | null
  todayActionCount?: number
}

export function LoveLanguagesWidget({
  totalLanguages = 0,
  sharedLanguages = 0,
  completedThisWeek = 0,
  topLanguages = [],
  partnerTopLanguage = null,
  todayActionCount = 0,
}: LoveLanguagesWidgetProps): React.ReactNode {
  const sharingPercent = totalLanguages > 0 ? Math.round((sharedLanguages / totalLanguages) * 100) : 0

  return (
    <Card className="bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Love Languages
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              Express love in meaningful ways
            </CardDescription>
          </div>
          <Link href="/love-languages">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-red-500">{totalLanguages}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Languages</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-pink-500">{sharedLanguages}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Shared</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-500">{completedThisWeek}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">This Week</p>
          </div>
        </div>

        {/* Progress Bar */}
        {totalLanguages > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sharing Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{sharingPercent}%</span>
            </div>
            <Progress value={sharingPercent} className="h-2" />
          </div>
        )}

        {/* Top Languages */}
        {topLanguages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Top Shared</p>
            <div className="flex flex-wrap gap-1.5">
              {topLanguages.map((lang) => (
                <span
                  key={lang.title}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300"
                >
                  {lang.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Today's Actions */}
        {totalLanguages > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Today&apos;s Actions
            </h4>
            {todayActionCount > 0 ? (
              <Link
                href="/love-languages"
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {todayActionCount} action{todayActionCount !== 1 ? 's' : ''} planned
                </p>
                <Button size="sm" variant="ghost">
                  View
                </Button>
              </Link>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No actions planned for today</p>
            )}
          </div>
        )}

        {/* Partner's Top Language */}
        {partnerTopLanguage && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Partner&apos;s Top Language:</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs text-gray-700 dark:text-gray-300">
                {partnerTopLanguage.category}
              </Badge>
              <span className="truncate text-sm text-gray-900 dark:text-white">{partnerTopLanguage.title}</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalLanguages === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">No love languages added yet</p>
            <Link href="/love-languages">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Language
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
