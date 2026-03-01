import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createMockSupabaseClient } from '@/test/mocks/supabase'

const mockUser = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }
const mockCoupleId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const mockCategoryId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'

let mockSupabase: ReturnType<typeof createMockSupabaseClient>

vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))
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
  it('creates with valid data', async () => {
    const { createCategory } = await import('./actions')

    // Profile lookup: from('profiles').select().eq().single()
    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    // eq is called for: profile select, categories select, categories insert
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder) // profile .eq('id', ...)
      .mockReturnValueOnce(mockSupabase._queryBuilder) // categories .eq('couple_id', ...)
    mockSupabase._queryBuilder.order = vi.fn().mockReturnValue(mockSupabase._queryBuilder)
    mockSupabase._queryBuilder.limit = vi.fn().mockResolvedValue({
      data: [{ sort_order: 3 }],
      error: null,
    })
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({ data: null, error: null })

    const fd = makeFormData({ name: 'New Category', description: 'A desc', icon: '🎉' })
    const result = await createCategory({}, fd)

    expect(result).toEqual({ success: true })
    expect(mockSupabase.from).toHaveBeenCalledWith('categories')
  })

  it('returns error when no couple', async () => {
    const { createCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData({ name: 'Test' })
    const result = await createCategory({}, fd)

    expect(result.error).toBe('You must be in a couple to create categories')
  })

  it('returns error when name is empty', async () => {
    const { createCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi.fn().mockReturnValueOnce(mockSupabase._queryBuilder)

    const fd = makeFormData({ name: '' })
    const result = await createCategory({}, fd)

    expect(result.error).toBeTruthy()
  })

  it('returns error on DB insert failure', async () => {
    const { createCategory } = await import('./actions')

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
      data: [],
      error: null,
    })
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    })

    const fd = makeFormData({ name: 'Valid Name' })
    const result = await createCategory({}, fd)

    expect(result.error).toBe('Something went wrong. Please try again.')
  })

  it('uses default icon when icon not provided', async () => {
    const { createCategory } = await import('./actions')

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
      data: [],
      error: null,
    })
    mockSupabase._queryBuilder.insert = vi.fn().mockResolvedValue({ data: null, error: null })

    const fd = makeFormData({ name: 'No Icon Category' })
    const result = await createCategory({}, fd)

    expect(result).toEqual({ success: true })
    expect(mockSupabase._queryBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ icon: '💬' }))
  })
})

describe('updateCategory', () => {
  it('updates with valid data', async () => {
    const { updateCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    // eq is called 3 times: profile .eq('id'), then .eq('id', categoryId), then .eq('couple_id', ...)
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder) // profile select chain
      .mockReturnValueOnce(mockSupabase._queryBuilder) // .eq('id', categoryId)
      .mockReturnValue({ data: null, error: null }) // .eq('couple_id', ...) terminal
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const fd = makeFormData({ name: 'Updated Name', icon: '🔥' })
    const result = await updateCategory(mockCategoryId, {}, fd)

    expect(result).toEqual({ success: true })
    expect(mockSupabase.from).toHaveBeenCalledWith('categories')
  })

  it('returns error when no couple', async () => {
    const { updateCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const fd = makeFormData({ name: 'Test' })
    const result = await updateCategory(mockCategoryId, {}, fd)

    expect(result.error).toBe('You must be in a couple to update categories')
  })

  it('returns error on DB failure', async () => {
    const { updateCategory } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValue({ data: null, error: { message: 'Update failed' } })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const fd = makeFormData({ name: 'Valid Name' })
    const result = await updateCategory(mockCategoryId, {}, fd)

    expect(result.error).toBe('Something went wrong. Please try again.')
  })
})

describe('toggleCategoryActive', () => {
  it('activates a category', async () => {
    const { toggleCategoryActive } = await import('./actions')

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

  it('deactivates a category', async () => {
    const { toggleCategoryActive } = await import('./actions')

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

    const result = await toggleCategoryActive(mockCategoryId, false)

    expect(result).toEqual({})
    expect(mockSupabase._queryBuilder.update).toHaveBeenCalledWith({ is_active: false })
  })

  it('returns error when no couple', async () => {
    const { toggleCategoryActive } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: null },
      error: null,
    })

    const result = await toggleCategoryActive(mockCategoryId, true)

    expect(result.error).toBe('You must be in a couple to update categories')
  })

  it('returns error on DB failure', async () => {
    const { toggleCategoryActive } = await import('./actions')

    mockSupabase._queryBuilder.single.mockResolvedValueOnce({
      data: { couple_id: mockCoupleId },
      error: null,
    })
    mockSupabase._queryBuilder.eq = vi
      .fn()
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValueOnce(mockSupabase._queryBuilder)
      .mockReturnValue({ data: null, error: { message: 'Toggle failed' } })
    mockSupabase._queryBuilder.update = vi.fn().mockReturnValue(mockSupabase._queryBuilder)

    const result = await toggleCategoryActive(mockCategoryId, true)

    expect(result.error).toBe('Something went wrong. Please try again.')
  })
})
