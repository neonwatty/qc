'use client'

import type { DbCouple, DbCoupleInvite, DbProfile, DbSessionSettings } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { CoupleSettings } from '@/components/settings/CoupleSettings'
import { SessionSettingsPanel } from '@/components/settings/SessionSettingsPanel'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { ThemeSelector } from '@/components/settings/ThemeSelector'
import { DangerZone } from '@/components/settings/DangerZone'
import { InviteStatus } from '@/components/settings/InviteStatus'

interface SettingsTabsProps {
  profile: DbProfile
  couple: DbCouple | null
  partner: DbProfile | null
  sessionSettings: DbSessionSettings | null
  pendingInvite: DbCoupleInvite | null
}

export function SettingsTabs({
  profile,
  couple,
  partner,
  sessionSettings,
  pendingInvite,
}: SettingsTabsProps) {
  const hasCoupleId = Boolean(profile.couple_id)

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="flex w-full flex-wrap gap-1">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="couple">Couple</TabsTrigger>
        <TabsTrigger value="session">Session</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileSettings profile={profile} />
      </TabsContent>

      <TabsContent value="couple" className="space-y-4">
        {pendingInvite && <InviteStatus invite={pendingInvite} />}
        <CoupleSettings couple={couple} partner={partner} />
      </TabsContent>

      <TabsContent value="session">
        <SessionSettingsPanel
          settings={sessionSettings}
          hasCoupleId={hasCoupleId}
        />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationSettings />
      </TabsContent>

      <TabsContent value="theme">
        <ThemeSelector />
      </TabsContent>

      <TabsContent value="danger">
        <DangerZone hasCoupleId={hasCoupleId} />
      </TabsContent>
    </Tabs>
  )
}
