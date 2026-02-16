'use client'

import { CheckInProvider } from '@/contexts/CheckInContext'
import { BookendsProvider } from '@/contexts/BookendsContext'
import { SessionSettingsProvider } from '@/contexts/SessionSettingsContext'
import { LoveLanguagesProvider } from '@/contexts/LoveLanguagesContext'

interface AppProvidersProps {
  children: React.ReactNode
  coupleId: string
  userId: string
}

export function AppProviders({ children, coupleId, userId }: AppProvidersProps): React.ReactNode {
  return (
    <CheckInProvider coupleId={coupleId} userId={userId}>
      <SessionSettingsProvider coupleId={coupleId}>
        <BookendsProvider coupleId={coupleId} userId={userId}>
          <LoveLanguagesProvider coupleId={coupleId} userId={userId}>
            {children}
          </LoveLanguagesProvider>
        </BookendsProvider>
      </SessionSettingsProvider>
    </CheckInProvider>
  )
}
