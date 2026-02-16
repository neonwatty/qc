'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface LoveLanguagesWidgetProps {
  totalLanguages?: number
  sharedLanguages?: number
  completedThisWeek?: number
}

export function LoveLanguagesWidget({
  totalLanguages = 0,
  sharedLanguages = 0,
  completedThisWeek = 0,
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
