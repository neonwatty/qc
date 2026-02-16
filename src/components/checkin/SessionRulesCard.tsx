'use client'

import React from 'react'
import { Clock, Pause, Users, Coffee, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { SessionSettings } from '@/types'

interface SessionRulesCardProps {
  settings: SessionSettings
  compact?: boolean
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

export function SessionRulesCard({ settings, compact = false }: SessionRulesCardProps): React.ReactNode {
  if (compact) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(settings.sessionDuration)}
            </Badge>
            {settings.turnBasedMode && (
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                Turn-based
              </Badge>
            )}
            {settings.timeoutsPerPartner > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Pause className="w-3 h-3" />
                {settings.timeoutsPerPartner} timeout{settings.timeoutsPerPartner > 1 ? 's' : ''}
              </Badge>
            )}
            {settings.warmUpQuestions && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Warm-up
              </Badge>
            )}
            {settings.coolDownTime > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Coffee className="w-3 h-3" />
                Cool-down
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Active Session Rules</CardTitle>
        <CardDescription>Agreed settings for your check-in sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Timing</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Session Duration</p>
                <p className="text-sm text-muted-foreground">{formatDuration(settings.sessionDuration)}</p>
              </div>
            </div>
            {settings.timeoutsPerPartner > 0 && (
              <div className="flex items-start gap-3">
                <Pause className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Timeouts</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.timeoutsPerPartner} per partner ({formatDuration(settings.timeoutDuration)} each)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {(settings.turnBasedMode || settings.warmUpQuestions) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Discussion</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {settings.turnBasedMode && (
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Turn-based Mode</p>
                      <p className="text-sm text-muted-foreground">{settings.turnDuration}s per turn</p>
                    </div>
                  </div>
                )}
                {settings.warmUpQuestions && (
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Warm-up</p>
                      <p className="text-sm text-muted-foreground">Ice-breaker questions</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
