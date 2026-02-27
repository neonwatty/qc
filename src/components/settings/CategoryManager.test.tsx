import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

const mockOrder = vi.fn().mockResolvedValue({
  data: [
    {
      id: 'c1',
      couple_id: 'couple1',
      name: 'Communication',
      description: 'Talk',
      icon: '\u{1F4AC}',
      is_active: true,
      is_system: true,
      sort_order: 1,
      created_at: '2025-01-01',
    },
    {
      id: 'c2',
      couple_id: 'couple1',
      name: 'Growth',
      description: 'Grow',
      icon: '\u{1F331}',
      is_active: true,
      is_system: false,
      sort_order: 2,
      created_at: '2025-01-02',
    },
  ],
  error: null,
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ order: mockOrder }) }) }),
  }),
}))

const mockUseRealtimeCouple = vi.fn()
vi.mock('@/hooks/useRealtimeCouple', () => ({
  useRealtimeCouple: (...args: unknown[]) => mockUseRealtimeCouple(...args),
}))

const mockCreateCategory = vi.fn().mockResolvedValue({ error: null })
const mockUpdateCategory = vi.fn().mockResolvedValue({ error: null })
const mockToggleCategoryActive = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/app/(app)/settings/actions', () => ({
  createCategory: (...args: unknown[]) => mockCreateCategory(...args),
  updateCategory: (...args: unknown[]) => mockUpdateCategory(...args),
  toggleCategoryActive: (...args: unknown[]) => mockToggleCategoryActive(...args),
}))

vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon" />,
}))

vi.mock('./CategoryFormDialog', () => ({
  CategoryFormDialog: (props: Record<string, unknown>) => (
    <div data-testid="category-form-dialog" data-is-open={String(props.isOpen)}>
      {props.isOpen && (
        <button data-testid="dialog-submit" onClick={props.onSubmit as () => void}>
          Submit
        </button>
      )}
    </div>
  ),
}))

vi.mock('./CategoryCard', () => ({
  CategoryCard: (props: Record<string, unknown>) => {
    const cat = props.category as { id: string; name: string }
    return (
      <div data-testid={`category-card-${cat.id}`}>
        {cat.name}
        <button data-testid={`edit-${cat.id}`} onClick={() => (props.onEdit as (c: unknown) => void)(props.category)}>
          Edit
        </button>
        <button
          data-testid={`toggle-${cat.id}`}
          onClick={() => (props.onToggleActive as (id: string, active: boolean) => void)(cat.id, false)}
        >
          Toggle
        </button>
      </div>
    )
  },
}))

const { CategoryManager } = await import('./CategoryManager')

beforeEach(() => {
  vi.clearAllMocks()
  mockOrder.mockResolvedValue({
    data: [
      {
        id: 'c1',
        couple_id: 'couple1',
        name: 'Communication',
        description: 'Talk',
        icon: '\u{1F4AC}',
        is_active: true,
        is_system: true,
        sort_order: 1,
        created_at: '2025-01-01',
      },
      {
        id: 'c2',
        couple_id: 'couple1',
        name: 'Growth',
        description: 'Grow',
        icon: '\u{1F331}',
        is_active: true,
        is_system: false,
        sort_order: 2,
        created_at: '2025-01-02',
      },
    ],
    error: null,
  })
})

describe('CategoryManager', () => {
  it('renders heading and Add Category button', () => {
    render(<CategoryManager coupleId="couple1" />)
    expect(screen.getByText('Discussion Categories')).toBeDefined()
    expect(screen.getByText('Add Category')).toBeDefined()
  })

  it('loads categories from Supabase on mount and renders cards', async () => {
    render(<CategoryManager coupleId="couple1" />)

    await waitFor(() => {
      expect(mockOrder).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByTestId('category-card-c1')).toBeDefined()
      expect(screen.getByTestId('category-card-c2')).toBeDefined()
    })

    expect(screen.getByText('Communication')).toBeDefined()
    expect(screen.getByText('Growth')).toBeDefined()
  })

  it('registers realtime subscription with correct table and coupleId', () => {
    render(<CategoryManager coupleId="couple1" />)

    expect(mockUseRealtimeCouple).toHaveBeenCalledWith(
      expect.objectContaining({
        table: 'categories',
        coupleId: 'couple1',
        onInsert: expect.any(Function),
        onUpdate: expect.any(Function),
        onDelete: expect.any(Function),
      }),
    )
  })

  it('opens dialog when Add Category button is clicked', async () => {
    render(<CategoryManager coupleId="couple1" />)

    const dialog = screen.getByTestId('category-form-dialog')
    expect(dialog.getAttribute('data-is-open')).toBe('false')

    fireEvent.click(screen.getByText('Add Category'))

    await waitFor(() => {
      expect(dialog.getAttribute('data-is-open')).toBe('true')
    })
  })

  it('opens dialog with form populated when edit button is clicked', async () => {
    render(<CategoryManager coupleId="couple1" />)

    await waitFor(() => {
      expect(screen.getByTestId('category-card-c2')).toBeDefined()
    })

    fireEvent.click(screen.getByTestId('edit-c2'))

    await waitFor(() => {
      const dialog = screen.getByTestId('category-form-dialog')
      expect(dialog.getAttribute('data-is-open')).toBe('true')
    })
  })

  it('calls toggleCategoryActive when toggle button is clicked', async () => {
    render(<CategoryManager coupleId="couple1" />)

    await waitFor(() => {
      expect(screen.getByTestId('category-card-c1')).toBeDefined()
    })

    fireEvent.click(screen.getByTestId('toggle-c1'))

    await waitFor(() => {
      expect(mockToggleCategoryActive).toHaveBeenCalledWith('c1', false)
    })
  })
})
