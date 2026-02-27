import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'

const storage: Record<string, string> = {}

vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => storage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete storage[key]
  }),
})

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return <ThemeProvider>{children}</ThemeProvider>
}

beforeEach(() => {
  for (const key of Object.keys(storage)) {
    delete storage[key]
  }
  document.documentElement.classList.remove('dark')
  document.documentElement.removeAttribute('data-theme')
  vi.clearAllMocks()
})

describe('ThemeContext', () => {
  it('useTheme throws outside provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider')
  })

  it('defaults to light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('setTheme changes to dark and persists', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    act(() => result.current.setTheme('dark'))

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-theme', 'dark')
  })

  it('toggle switches between light and dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('light')

    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')

    act(() => result.current.toggle())
    expect(result.current.theme).toBe('light')
  })

  it('reads stored theme from localStorage on init', () => {
    storage['qc-theme'] = 'dark'

    const { result } = renderHook(() => useTheme(), { wrapper })

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })
})
