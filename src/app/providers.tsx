'use client'

import { Toaster } from 'sonner'

import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  )
}
