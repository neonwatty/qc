'use client'

import { Toaster } from 'sonner'
import { MotionConfig } from 'framer-motion'

import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster position="top-center" richColors />
      </MotionConfig>
    </ThemeProvider>
  )
}
