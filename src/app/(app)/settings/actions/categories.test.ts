import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const mockCategoryId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({ requireAuth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

beforeEach(async () => {
  vi.clearAllMocks()
  mockSupabase = createMockSupabaseClient()
  const { requireAuth } = await import('@/lib/auth')
  ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  })
})

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.append(k, v)
  return fd
}

describe('createCategory', () => {
  it('returns error when no couple', async () => {
    const { createCategory } = await import('./categories')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData({ name: 'Test' })
    const result = await createCategory({}, fd)

    expect(result.error).toBe('You must be in a couple to create categories')
  })

  it('returns success with valid input', async () => {
    const { createCategory } = await import('./categories')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce(mockSupabase._queryBuilder)
    mockSupabase._queryBuilder.order = vi.fn().mockReturnValue(mockSupabase._queryBuilder)
    mockSupabase._queryBuilder.limit = vi.fn().mockResolvedValue({
      data: [{ sort_order: 5 }],
      error: null,
    })
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({ data: null, error: null })

    const fd = makeFormData({ name: 'New Category', description: 'Desc', icon: '🎉' })
    const result = await createCategory({}, fd)

    expect(result).toEqual({ success: true })
  })

  it('returns validation error on empty name', async () => {
    const { createCategory } = await import('./categories')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi.fn().mockReturnValueOnce(mockSupabase._queryBuilder)

    const fd = makeFormData({ name: '' })
    const result = await createCategory({}, fd)

    expect(result.error).toBeTruthy()
  })
})

describe('updateCategory', () => {
  it('returns success on valid input', async () => {
    const { updateCategory } = await import('./categories')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValue({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const fd = makeFormData({ name: 'Updated Name', icon: '🔥' })
    const result = await updateCategory(mockCategoryId, {}, fd)

    expect(result).toEqual({ success: true })
  })

  it('returns error when no couple', async () => {
    const { updateCategory } = await import('./categories')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData({ name: 'Test' })
    const result = await updateCategory(mockCategoryId, {}, fd)

    expect(result.error).toBe('You must be in a couple to update categories')
  })
})

describe('toggleCategoryActive', () => {
  it('returns success', async () => {
    const { toggleCategoryActive } = await import('./categories')
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValue({ data: null, error: null })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const result = await toggleCategoryActive(mockCategoryId, true)

    expect(result).toEqual({})
    expect(mockSupabase._queryBuilder.update).toHaveBeenCalledWith({ is_active: true })
  })
})
