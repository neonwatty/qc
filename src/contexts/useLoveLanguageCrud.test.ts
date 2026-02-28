import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

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

import { useLoveLanguageCrud } from '@/contexts/useLoveLanguageCrud'
import type { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import type { NewLanguageInput, NewActionInput, NewDiscoveryInput } from '@/contexts/useLoveLanguageCrud'
import {
  insertLanguage,
  updateLanguageDb,
  deleteLanguageDb,
  insertAction,
  completeActionDb,
} from '@/lib/love-language-operations'
import { insertDiscovery, deleteDiscoveryDb } from '@/lib/love-language-discovery-operations'

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

const fakeAction: LoveAction = {
  id: 'a1',
  coupleId: 'couple-1',
  linkedLanguageId: null,
  title: 'Hug',
  description: null,
  status: 'suggested',
  frequency: 'weekly',
  difficulty: 'easy',
  completedCount: 2,
  lastCompletedAt: null,
  createdAt: '2026-01-01',
}

function makeParams(overrides?: { languages?: LoveLanguage[]; actions?: LoveAction[] }) {
  return {
    coupleId: 'couple-1',
    userId: 'user-1',
    languages: overrides?.languages ?? [],
    actions: overrides?.actions ?? [],
    setLanguages: vi.fn(),
    setActions: vi.fn(),
    setDiscoveries: vi.fn() as React.Dispatch<React.SetStateAction<LoveLanguageDiscovery[]>>,
  }
}

describe('useLoveLanguageCrud', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addLanguage calls insertLanguage and prepends to state', async () => {
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

  it('updateLanguage calls updateLanguageDb and updates in state', async () => {
    vi.mocked(updateLanguageDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.updateLanguage('lang-1', { title: 'Updated' }))

    expect(updateLanguageDb).toHaveBeenCalledWith('lang-1', { title: 'Updated' })
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('deleteLanguage calls deleteLanguageDb and removes from state', async () => {
    vi.mocked(deleteLanguageDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteLanguage('lang-1'))

    expect(deleteLanguageDb).toHaveBeenCalledWith('lang-1')
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('toggleLanguagePrivacy toggles from private to shared', async () => {
    vi.mocked(updateLanguageDb).mockResolvedValue(undefined)
    const privateLang = { ...fakeLang, id: 'l1', privacy: 'private' as const }
    const params = makeParams({ languages: [privateLang] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.toggleLanguagePrivacy('l1'))

    expect(updateLanguageDb).toHaveBeenCalledWith('l1', { privacy: 'shared' })
    expect(params.setLanguages).toHaveBeenCalled()
  })

  it('addAction calls insertAction and prepends to state', async () => {
    vi.mocked(insertAction).mockResolvedValue(fakeAction)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))
    const input: NewActionInput = {
      linkedLanguageId: null,
      title: 'Hug',
      description: null,
      status: 'suggested',
      frequency: 'weekly',
      difficulty: 'easy',
    }

    await act(() => result.current.addAction(input))

    expect(insertAction).toHaveBeenCalledWith('couple-1', input)
    expect(params.setActions).toHaveBeenCalled()
  })

  it('completeAction increments completedCount', async () => {
    vi.mocked(completeActionDb).mockResolvedValue(undefined)
    const params = makeParams({ actions: [fakeAction] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.completeAction('a1'))

    expect(completeActionDb).toHaveBeenCalledWith('a1', 2)
    expect(params.setActions).toHaveBeenCalled()
  })

  it('addDiscovery calls insertDiscovery and prepends', async () => {
    const fakeDiscovery: LoveLanguageDiscovery = {
      id: 'd1',
      coupleId: 'couple-1',
      userId: 'user-1',
      checkInId: null,
      discovery: 'likes words',
      convertedToLanguageId: null,
      createdAt: '2026-01-01',
    }
    vi.mocked(insertDiscovery).mockResolvedValue(fakeDiscovery)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))
    const input: NewDiscoveryInput = { discovery: 'likes words' }

    await act(() => result.current.addDiscovery(input))

    expect(insertDiscovery).toHaveBeenCalledWith('couple-1', 'user-1', input)
    expect(params.setDiscoveries).toHaveBeenCalled()
  })

  it('deleteDiscovery removes from state', async () => {
    vi.mocked(deleteDiscoveryDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteDiscovery('d1'))

    expect(deleteDiscoveryDb).toHaveBeenCalledWith('d1')
    expect(params.setDiscoveries).toHaveBeenCalled()
  })
})
