'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'qc-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyThemeToDOM(resolved: 'light' | 'dark'): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

// External store for theme -- initialized eagerly on module load (client only)
let currentTheme: Theme = readStoredTheme()
let listeners: Array<() => void> = []

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): Theme {
  return currentTheme
}

function getServerSnapshot(): Theme {
  return 'system'
}

function setThemeExternal(newTheme: Theme): void {
  currentTheme = newTheme
  localStorage.setItem(STORAGE_KEY, newTheme)
  applyThemeToDOM(resolveTheme(newTheme))
  emitChange()
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactNode {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const resolved = typeof window !== 'undefined' ? resolveTheme(theme) : 'light'

  // Apply theme class to DOM whenever resolved theme changes
  useEffect(() => {
    applyThemeToDOM(resolved)
  }, [resolved])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange(): void {
      if (currentTheme === 'system') {
        applyThemeToDOM(getSystemTheme())
        emitChange()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeExternal(newTheme)
  }, [])

  const value = useMemo(() => ({ theme, resolvedTheme: resolved, setTheme }), [theme, resolved, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
