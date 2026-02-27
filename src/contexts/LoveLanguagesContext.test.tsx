/* eslint-disable max-lines-per-function */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({}),
}))

vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: vi.fn(),
}))

const mockFetchLanguages = vi.fn().mockResolvedValue([])
const mockFetchActions = vi.fn().mockResolvedValue([])
vi.mock('@/lib/love-language-operations', () => ({
  mapDbLanguage: vi.fn(),
  mapDbAction: vi.fn(),
  fetchLanguages: (...args: unknown[]) => mockFetchLanguages(...args),
  fetchActions: (...args: unknown[]) => mockFetchActions(...args),
}))

const mockFetchDiscoveries = vi.fn().mockResolvedValue([])
vi.mock('@/lib/love-language-discovery-operations', () => ({
  mapDbDiscovery: vi.fn(),
  fetchDiscoveries: (...args: unknown[]) => mockFetchDiscoveries(...args),
}))

vi.mock('./useLoveLanguageCrud', () => ({
  useLoveLanguageCrud: vi.fn().mockReturnValue({
    addLanguage: vi.fn(),
    updateLanguage: vi.fn(),
    deleteLanguage: vi.fn(),
    toggleLanguagePrivacy: vi.fn(),
    addAction: vi.fn(),
    updateAction: vi.fn(),
    deleteAction: vi.fn(),
    completeAction: vi.fn(),
    addDiscovery: vi.fn(),
    deleteDiscovery: vi.fn(),
    convertToLanguage: vi.fn(),
  }),
}))

const { LoveLanguagesProvider, useLoveLanguages } = await import('./LoveLanguagesContext')

function wrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <LoveLanguagesProvider coupleId="couple-1" userId="user-1">
      {children}
    </LoveLanguagesProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetchLanguages.mockResolvedValue([])
  mockFetchActions.mockResolvedValue([])
  mockFetchDiscoveries.mockResolvedValue([])
})

describe('useLoveLanguages', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useLoveLanguages())).toThrow(
      'useLoveLanguages must be used within LoveLanguagesProvider',
    )
  })

  it('starts with isLoading true', () => {
    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('finishes loading with empty arrays', async () => {
    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.languages).toEqual([])
    expect(result.current.actions).toEqual([])
    expect(result.current.discoveries).toEqual([])
  })

  it('filters my languages from partner languages', async () => {
    mockFetchLanguages.mockResolvedValue([
      { id: 'l1', userId: 'user-1', privacy: 'shared', title: 'Mine' },
      { id: 'l2', userId: 'user-2', privacy: 'shared', title: 'Partner' },
      { id: 'l3', userId: 'user-2', privacy: 'private', title: 'PartnerPrivate' },
    ])

    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.languages).toHaveLength(1)
    expect(result.current.languages[0].title).toBe('Mine')
    expect(result.current.partnerLanguages).toHaveLength(1)
    expect(result.current.partnerLanguages[0].title).toBe('Partner')
  })

  it('exposes CRUD methods from useLoveLanguageCrud', async () => {
    const { result } = renderHook(() => useLoveLanguages(), { wrapper })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(typeof result.current.addLanguage).toBe('function')
    expect(typeof result.current.deleteAction).toBe('function')
    expect(typeof result.current.convertToLanguage).toBe('function')
  })
})
