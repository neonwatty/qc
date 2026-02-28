import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/hooks/useRealtimeCouple', () => ({ useRealtimeCouple: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/components/notes/NoteEditor', () => ({
  NoteEditor: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="note-editor" /> : null),
}))
vi.mock('@/components/notes/NoteList', () => ({
  NoteList: ({ notes, currentUserId }: { notes: unknown[]; currentUserId: string }) => (
    <div data-testid="note-list" data-count={notes.length} data-user={currentUserId} />
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotesPageContent', () => {
  it('renders Notes title', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    expect(screen.getByText('Notes')).toBeDefined()
  })

  it('renders description text', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    expect(screen.getByText('Keep track of your thoughts, insights, and reflections')).toBeDefined()
  })

  it('renders New Note button', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    expect(screen.getByText('New Note')).toBeDefined()
  })

  it('renders NoteList with correct count', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    expect(screen.getByTestId('note-list').getAttribute('data-count')).toBe('2')
  })

  it('NoteEditor is closed by default', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    expect(screen.queryByTestId('note-editor')).toBeNull()
  })

  it('clicking New Note opens NoteEditor', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    fireEvent.click(screen.getByText('New Note'))
    expect(screen.getByTestId('note-editor')).toBeDefined()
  })

  it('renders NoteList with provided notes count', () => {
    render(<NotesPageContent notes={[mockNotes[0]]} currentUserId="u1" coupleId="c1" />)
    expect(screen.getByTestId('note-list').getAttribute('data-count')).toBe('1')
  })

  it('NoteList receives currentUserId', () => {
    render(<NotesPageContent notes={mockNotes} currentUserId="u1" coupleId="c1" />)
    expect(screen.getByTestId('note-list').getAttribute('data-user')).toBe('u1')
  })
})
