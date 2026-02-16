'use client'

import React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'

// These providers will be created by other agents (Agent 2, Agent 6, etc.)
// Import them once they exist:
// import { CheckInProvider } from '@/contexts/CheckInContext'
// import { BookendsProvider } from '@/contexts/BookendsContext'
// import { SessionSettingsProvider } from '@/contexts/SessionSettingsContext'
// import { LoveLanguagesProvider } from '@/contexts/LoveLanguagesContext'

export function Providers({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <ThemeProvider>
      {/* Uncomment as other agents create these contexts:
        <CheckInProvider>
          <SessionSettingsProvider>
            <BookendsProvider>
              <LoveLanguagesProvider>
                {children}
              </LoveLanguagesProvider>
            </BookendsProvider>
          </SessionSettingsProvider>
        </CheckInProvider>
      */}
      {children}
    </ThemeProvider>
  )
}
