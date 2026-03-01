import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/hooks/useRealtimeCouple', () => ({ useRealtimeCouple: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/components/notes/NoteEditor', () => ({
  NoteEditor: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="note-editor" /> : null),
}))
vi.mock('@/components/notes/NoteList', () => ({
  NoteList: ({
    notes,
    currentUserId,
    categories,
    selectMode,
  }: {
    notes: unknown[]
    currentUserId: string
    categories?: unknown[]
    selectMode?: boolean
  }) => (
    <div
      data-testid="note-list"
      data-count={notes.length}
      data-user={currentUserId}
      data-categories={categories?.length ?? 0}
      data-select-mode={!!selectMode}
    />
  ),
}))
vi.mock('@/components/layout/PageContainer', () => ({
  PageContainer: ({
    children,
    title,
    description,
    action,
  }: {
    children: React.ReactNode
    title: string
    description?: string
    action?: React.ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {action}
      {children}
    </div>
  ),
}))
vi.mock('./actions', () => ({
  deleteNoteById: vi.fn(() => Promise.resolve({ error: null })),
  bulkDeleteNotes: vi.fn(() => Promise.resolve({ error: null })),
}))

const { NotesPageContent } = await import('./notes-content')

const mockNotes = [
  {
    id: 'n1',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Note one',
    privacy: 'shared' as const,
    tags: [],
    category_id: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'n2',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Note two',
    privacy: 'private' as const,
    tags: [],
    category_id: null,
    created_at: '',
    updated_at: '',
  },
]

const mockCategories = [
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
    created_at: '',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotesPageContent', () => {
  it('renders Notes title', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByText('Notes')).toBeDefined()
  })

  it('renders description text', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByText('Keep track of your thoughts, insights, and reflections')).toBeDefined()
  })

  it('renders New Note button', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByText('New Note')).toBeDefined()
  })

  it('renders Select button', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByText('Select')).toBeDefined()
  })

  it('renders NoteList with correct count', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByTestId('note-list').getAttribute('data-count')).toBe('2')
  })

  it('NoteEditor is closed by default', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.queryByTestId('note-editor')).toBeNull()
  })

  it('clicking New Note opens NoteEditor', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    fireEvent.click(screen.getByText('New Note'))
    expect(screen.getByTestId('note-editor')).toBeDefined()
  })

  it('renders NoteList with provided notes count', () => {
    render(<NotesPageContent notes={[mockNotes[0]]} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByTestId('note-list').getAttribute('data-count')).toBe('1')
  })

  it('NoteList receives currentUserId', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByTestId('note-list').getAttribute('data-user')).toBe('u1')
  })

  it('passes categories to NoteList', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    expect(screen.getByTestId('note-list').getAttribute('data-categories')).toBe('1')
  })

  it('clicking Select shows Cancel button and hides New Note', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    fireEvent.click(screen.getByText('Select'))
    expect(screen.getByText('Cancel')).toBeDefined()
    expect(screen.queryByText('New Note')).toBeNull()
  })

  it('clicking Cancel exits select mode', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    fireEvent.click(screen.getByText('Select'))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('Select')).toBeDefined()
    expect(screen.getByText('New Note')).toBeDefined()
  })

  it('passes selectMode to NoteList when in select mode', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" categories={mockCategories} />)
    fireEvent.click(screen.getByText('Select'))
    expect(screen.getByTestId('note-list').getAttribute('data-select-mode')).toBe('true')
  })
})
