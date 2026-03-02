import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { DbNote, DbCategory } from '@/types'

vi.mock('./NoteCard', () => ({
  NoteCard: ({
    note,
    isOwn,
    onDelete,
    selectMode,
    isSelected,
    category,
  }: {
    note: DbNote
    isOwn: boolean
    onDelete?: unknown
    selectMode?: boolean
    isSelected?: boolean
    category?: DbCategory | null
  }) => (
    <div
      data-testid={`note-${note.id}`}
      data-own={isOwn}
      data-deletable={!!onDelete}
      data-select-mode={!!selectMode}
      data-selected={!!isSelected}
      data-category={category?.name ?? ''}
    >
      {note.content}
    </div>
  ),
}))

const { NoteList } = await import('./NoteList')

const mockCategories: DbCategory[] = [
  {
    id: 'cat1',
    couple_id: 'c1',
    name: 'Reflections',
    description: null,
    icon: '💭',
    is_active: true,
    is_system: false,
    sort_order: 0,
    prompts: [],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat2',
    couple_id: 'c1',
    name: 'Goals',
    description: null,
    icon: '🎯',
    is_active: true,
    is_system: false,
    sort_order: 1,
    prompts: [],
    created_at: '2026-01-01T00:00:00Z',
  },
]

const mockNotes: DbNote[] = [
  {
    id: 'n1',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Hello world',
    privacy: 'shared',
    tags: ['greeting'],
    category_id: 'cat1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'n2',
    couple_id: 'c1',
    author_id: 'u2',
    check_in_id: null,
    content: 'Partner note',
    privacy: 'private',
    tags: ['secret'],
    category_id: 'cat2',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'n3',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'My draft',
    privacy: 'draft',
    tags: [],
    category_id: null,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'n4',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Recent note',
    privacy: 'shared',
    tags: [],
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const defaultProps = { notes: mockNotes, currentUserId: 'u1', onSelect: vi.fn(), onDelete: vi.fn() }

describe('NoteList filtering and display', () => {
  it('renders all notes by default', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.getByTestId('note-n2')).toBeDefined()
    expect(screen.getByTestId('note-n3')).toBeDefined()
    expect(screen.getByTestId('note-n4')).toBeDefined()
  })

  it('filters by privacy when clicking filter buttons', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.click(screen.getByText('Shared'))
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
    expect(screen.queryByTestId('note-n3')).toBeNull()
  })

  it('filters by search term in content', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes, categories, or tags...'), {
      target: { value: 'partner' },
    })
    expect(screen.queryByTestId('note-n1')).toBeNull()
    expect(screen.getByTestId('note-n2')).toBeDefined()
  })

  it('filters by search term in tags', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes, categories, or tags...'), {
      target: { value: 'greeting' },
    })
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
  })

  it('shows empty state when no notes match', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes, categories, or tags...'), {
      target: { value: 'nonexistent' },
    })
    expect(screen.getByText('No notes found')).toBeDefined()
  })

  it('only passes onDelete for own notes', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.getByTestId('note-n1').getAttribute('data-deletable')).toBe('true')
    expect(screen.getByTestId('note-n2').getAttribute('data-deletable')).toBe('false')
  })

  it('displays result count and sort dropdown', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.getByText('4 notes')).toBeDefined()
    expect(screen.getByDisplayValue('Newest first')).toBeDefined()
  })

  it('shows filtered count when search is active', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes, categories, or tags...'), {
      target: { value: 'partner' },
    })
    expect(screen.getByText('1 note found')).toBeDefined()
  })

  it('shows category dropdown when categories provided', () => {
    render(<NoteList {...defaultProps} categories={mockCategories} />)
    expect(screen.getByLabelText('Filter by category')).toBeDefined()
    expect(screen.getByText('All categories')).toBeDefined()
  })

  it('does not show category dropdown when no categories', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.queryByLabelText('Filter by category')).toBeNull()
  })

  it('filters notes by category', () => {
    render(<NoteList {...defaultProps} categories={mockCategories} />)
    fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'cat1' } })
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
  })

  it('filters by uncategorized', () => {
    render(<NoteList {...defaultProps} categories={mockCategories} />)
    fireEvent.change(screen.getByLabelText('Filter by category'), { target: { value: 'uncategorized' } })
    expect(screen.queryByTestId('note-n1')).toBeNull()
    expect(screen.getByTestId('note-n3')).toBeDefined()
    expect(screen.getByTestId('note-n4')).toBeDefined()
  })

  it('passes category to NoteCard', () => {
    render(<NoteList {...defaultProps} categories={mockCategories} />)
    expect(screen.getByTestId('note-n1').getAttribute('data-category')).toBe('Reflections')
    expect(screen.getByTestId('note-n3').getAttribute('data-category')).toBe('')
  })

  it('renders date range filter buttons', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.getByText('Any time')).toBeDefined()
    expect(screen.getByText('Today')).toBeDefined()
    expect(screen.getByText('Last 7 days')).toBeDefined()
    expect(screen.getByText('Last 30 days')).toBeDefined()
  })

  it('filters by Today date range', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.click(screen.getByText('Today'))
    expect(screen.getByTestId('note-n4')).toBeDefined()
    expect(screen.queryByTestId('note-n1')).toBeNull()
  })

  it('shows "found" suffix when date range filter is active', () => {
    render(<NoteList {...defaultProps} />)
    fireEvent.click(screen.getByText('Today'))
    expect(screen.getByText('1 note found')).toBeDefined()
  })
})

const bulkProps = {
  ...defaultProps,
  selectMode: true,
  selectedIds: new Set<string>(),
  onToggleSelect: vi.fn(),
  onSelectAllOwn: vi.fn(),
  onClearSelection: vi.fn(),
  onBulkDelete: vi.fn(),
}

describe('NoteList bulk operations', () => {
  it('shows bulk action bar in select mode', () => {
    render(<NoteList {...bulkProps} />)
    expect(screen.getByText('0 selected')).toBeDefined()
    expect(screen.getByText('Select all own')).toBeDefined()
    expect(screen.getByText('Clear')).toBeDefined()
  })

  it('shows delete button with count when items selected', () => {
    render(<NoteList {...bulkProps} selectedIds={new Set(['n1', 'n3'])} />)
    expect(screen.getByText('2 selected')).toBeDefined()
    expect(screen.getByText('Delete 2')).toBeDefined()
  })

  it('does not show bulk bar when not in select mode', () => {
    render(<NoteList {...defaultProps} />)
    expect(screen.queryByText('selected')).toBeNull()
  })

  it('calls onBulkDelete when delete button clicked', () => {
    const onBulkDelete = vi.fn()
    render(<NoteList {...bulkProps} selectedIds={new Set(['n1'])} onBulkDelete={onBulkDelete} />)
    fireEvent.click(screen.getByText('Delete 1'))
    expect(onBulkDelete).toHaveBeenCalledOnce()
  })

  it('calls onSelectAllOwn when select all own clicked', () => {
    const onSelectAllOwn = vi.fn()
    render(<NoteList {...bulkProps} onSelectAllOwn={onSelectAllOwn} />)
    fireEvent.click(screen.getByText('Select all own'))
    expect(onSelectAllOwn).toHaveBeenCalledOnce()
  })

  it('passes selectMode and isSelected to NoteCard', () => {
    render(<NoteList {...bulkProps} selectedIds={new Set(['n1'])} />)
    expect(screen.getByTestId('note-n1').getAttribute('data-select-mode')).toBe('true')
    expect(screen.getByTestId('note-n1').getAttribute('data-selected')).toBe('true')
    expect(screen.getByTestId('note-n2').getAttribute('data-selected')).toBe('false')
  })
})
