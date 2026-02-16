'use client'

import { AppHeader } from '@/components/layout/AppHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

interface AppShellProps {
  children: React.ReactNode
  userEmail: string
  displayName: string | null
  avatarUrl: string | null
  coupleName: string | null
}

export function AppShell({ children, userEmail, displayName, avatarUrl, coupleName }: AppShellProps): React.ReactNode {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader userEmail={userEmail} displayName={displayName} avatarUrl={avatarUrl} coupleName={coupleName} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
