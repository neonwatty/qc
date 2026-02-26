import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useLoveLanguageCrud } from '@/contexts/useLoveLanguageCrud'
import type { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import type { NewLanguageInput } from '@/contexts/useLoveLanguageCrud'

vi.mock('@/lib/love-language-operations', () => ({
  insertLanguage: vi.fn(),
  updateLanguageDb: vi.fn(),
  deleteLanguageDb: vi.fn(),
  insertAction: vi.fn(),
  updateActionDb: vi.fn(),
  deleteActionDb: vi.fn(),
  completeActionDb: vi.fn(),
}))
vi.mock('@/lib/love-language-discovery-operations', () => ({
  insertDiscovery: vi.fn(),
  deleteDiscoveryDb: vi.fn(),
  convertDiscoveryToLanguage: vi.fn(),
}))
vi.mock('@/lib/supabase/client', () => ({ createClient: vi.fn() }))

import { insertLanguage, updateLanguageDb, deleteLanguageDb } from '@/lib/love-language-operations'

function makeParams(overrides?: { languages?: LoveLanguage[] }) {
  return {
    coupleId: 'couple-1',
    userId: 'user-1',
    languages: overrides?.languages ?? [],
    actions: [] as LoveAction[],
    setLanguages: vi.fn(),
    setActions: vi.fn(),
    setDiscoveries: vi.fn() as React.Dispatch<React.SetStateAction<LoveLanguageDiscovery[]>>,
  }
}

const fakeLang: LoveLanguage = {
  id: 'lang-1',
  coupleId: 'couple-1',
  userId: 'user-1',
  title: 'Words',
  description: null,
  category: 'words',
  privacy: 'shared',
  importance: 'high',
  examples: [],
  tags: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

describe('useLoveLanguageCrud — languages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('addLanguage calls insertLanguage and updates state', async () => {
    vi.mocked(insertLanguage).mockResolvedValue(fakeLang)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    const input: NewLanguageInput = {
      title: 'Words',
      description: null,
      category: 'words',
      privacy: 'shared',
      importance: 'high',
      examples: [],
      tags: [],
    }

    await act(() => result.current.addLanguage(input))

    expect(insertLanguage).toHaveBeenCalledWith('couple-1', 'user-1', input)
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('updateLanguage calls updateLanguageDb', async () => {
    vi.mocked(updateLanguageDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.updateLanguage('id-1', { title: 'X' }))

    expect(updateLanguageDb).toHaveBeenCalledWith('id-1', { title: 'X' })
  })

  it('deleteLanguage calls deleteLanguageDb', async () => {
    vi.mocked(deleteLanguageDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteLanguage('id-1'))

    expect(deleteLanguageDb).toHaveBeenCalledWith('id-1')
  })

  it('toggleLanguagePrivacy switches private to shared', async () => {
    vi.mocked(updateLanguageDb).mockResolvedValue(undefined)
    const privateLang = { ...fakeLang, id: 'l1', privacy: 'private' as const }
    const params = makeParams({ languages: [privateLang] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.toggleLanguagePrivacy('l1'))

    expect(updateLanguageDb).toHaveBeenCalledWith('l1', { privacy: 'shared' })
  })

  it('toggleLanguagePrivacy no-ops for unknown id', async () => {
    const params = makeParams({ languages: [] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.toggleLanguagePrivacy('nope'))

    expect(updateLanguageDb).not.toHaveBeenCalled()
  })
})
