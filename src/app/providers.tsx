'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps): React.ReactNode {
  return <ThemeProvider>{children}</ThemeProvider>
}
