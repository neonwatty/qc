import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useLoveLanguageCrud } from '@/contexts/useLoveLanguageCrud'
import type { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import type { NewActionInput, NewDiscoveryInput, NewLanguageInput } from '@/contexts/useLoveLanguageCrud'

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
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  }),
}))

import { insertAction, deleteActionDb, completeActionDb, insertLanguage } from '@/lib/love-language-operations'
import {
  insertDiscovery,
  deleteDiscoveryDb,
  convertDiscoveryToLanguage,
} from '@/lib/love-language-discovery-operations'

function makeParams(overrides?: { actions?: LoveAction[] }) {
  return {
    coupleId: 'couple-1',
    userId: 'user-1',
    languages: [] as LoveLanguage[],
    actions: overrides?.actions ?? [],
    setLanguages: vi.fn(),
    setActions: vi.fn(),
    setDiscoveries: vi.fn() as React.Dispatch<React.SetStateAction<LoveLanguageDiscovery[]>>,
  }
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

describe('useLoveLanguageCrud — actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addAction calls insertAction and updates state', async () => {
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

  it('deleteAction calls deleteActionDb', async () => {
    vi.mocked(deleteActionDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteAction('a1'))

    expect(deleteActionDb).toHaveBeenCalledWith('a1')
  })

  it('completeAction increments count', async () => {
    vi.mocked(completeActionDb).mockResolvedValue(undefined)
    const params = makeParams({ actions: [fakeAction] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.completeAction('a1'))

    expect(completeActionDb).toHaveBeenCalledWith('a1', 2)
  })

  it('completeAction no-ops for unknown id', async () => {
    const params = makeParams({ actions: [] })
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.completeAction('nope'))

    expect(completeActionDb).not.toHaveBeenCalled()
  })
})

describe('useLoveLanguageCrud — discoveries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addDiscovery calls insertDiscovery', async () => {
    const fakeDiscovery: LoveLanguageDiscovery = {
      id: 'd1',
      coupleId: 'couple-1',
      userId: 'user-1',
      checkInId: null,
      discovery: 'test',
      convertedToLanguageId: null,
      createdAt: '2026-01-01',
    }
    vi.mocked(insertDiscovery).mockResolvedValue(fakeDiscovery)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    const input: NewDiscoveryInput = { discovery: 'test' }
    await act(() => result.current.addDiscovery(input))

    expect(insertDiscovery).toHaveBeenCalledWith('couple-1', 'user-1', input)
    expect(params.setDiscoveries).toHaveBeenCalled()
  })

  it('deleteDiscovery calls deleteDiscoveryDb', async () => {
    vi.mocked(deleteDiscoveryDb).mockResolvedValue(undefined)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    await act(() => result.current.deleteDiscovery('d1'))

    expect(deleteDiscoveryDb).toHaveBeenCalledWith('d1')
  })

  it('convertToLanguage creates language and links discovery', async () => {
    const newLang = {
      id: 'lang-new',
      coupleId: 'couple-1',
      userId: 'user-1',
      title: 'Touch',
      description: null,
      category: 'touch' as const,
      privacy: 'shared' as const,
      importance: 'high' as const,
      examples: [],
      tags: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }
    const updatedDiscovery: LoveLanguageDiscovery = {
      id: 'd1',
      coupleId: 'couple-1',
      userId: 'user-1',
      checkInId: null,
      discovery: 'likes touch',
      convertedToLanguageId: 'lang-new',
      createdAt: '2026-01-01',
    }
    vi.mocked(insertLanguage).mockResolvedValue(newLang)
    vi.mocked(convertDiscoveryToLanguage).mockResolvedValue(updatedDiscovery)
    const params = makeParams()
    const { result } = renderHook(() => useLoveLanguageCrud(params))

    const langInput: NewLanguageInput = {
      title: 'Touch',
      description: null,
      category: 'touch',
      privacy: 'shared',
      importance: 'high',
      examples: [],
      tags: [],
    }
    await act(() => result.current.convertToLanguage('d1', langInput))

    expect(insertLanguage).toHaveBeenCalledWith('couple-1', 'user-1', langInput)
    expect(convertDiscoveryToLanguage).toHaveBeenCalledWith('d1', 'lang-new')
    expect(params.setLanguages).toHaveBeenCalled()
    expect(params.setDiscoveries).toHaveBeenCalled()
  })
})
