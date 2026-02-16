'use client'

import { useState } from 'react'

import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { RelationshipSettings } from '@/components/settings/RelationshipSettings'
import { SessionSettingsPanel } from '@/components/settings/SessionSettingsPanel'
import type { DbCouple, DbProfile, DbSessionSettings } from '@/types/database'

type SettingsTab = 'profile' | 'relationship' | 'session'

interface Props {
  profile: DbProfile | null
  couple: DbCouple | null
  sessionSettings: DbSessionSettings | null
  partner: { id: string; display_name: string | null; email: string } | null
  pendingInvite: { id: string; invited_email: string; status: string } | null
  userEmail: string
}

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'session', label: 'Session Rules' },
]

export function SettingsContent({
  profile,
  couple,
  sessionSettings,
  partner,
  pendingInvite,
  userEmail,
}: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileSettings profile={profile} userEmail={userEmail} />}

      {activeTab === 'relationship' && (
        <RelationshipSettings couple={couple} partner={partner} pendingInvite={pendingInvite} />
      )}

      {activeTab === 'session' && (
        <SessionSettingsPanel sessionSettings={sessionSettings} coupleId={couple?.id ?? null} />
      )}
    </div>
  )
}
