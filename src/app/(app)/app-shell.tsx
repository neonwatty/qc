'use client'

import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

interface AppShellProps {
  children: React.ReactNode
  displayName: string | null
  avatarUrl: string | null
}

export function AppShell({ children, displayName, avatarUrl }: AppShellProps): React.ReactNode {
  return (
    <div className="flex min-h-screen lg:h-screen safe-area-inset">
      {/* Desktop Sidebar Navigation */}
      <Navigation />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header displayName={displayName} avatarUrl={avatarUrl} />

        {/* Page Content */}
        <main
          id="main-content"
          className="flex-1 overflow-auto pb-16 lg:pb-0 px-2 sm:px-4 lg:px-8 py-6 safe-area-bottom scroll-smooth"
        >
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
