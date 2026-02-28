import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { DbNote } from '@/types'

vi.mock('./NoteCard', () => ({
  NoteCard: ({ note, isOwn, onDelete }: { note: DbNote; isOwn: boolean; onDelete?: unknown }) => (
    <div data-testid={`note-${note.id}`} data-own={isOwn} data-deletable={!!onDelete}>
      {note.content}
    </div>
  ),
}))

const { NoteList } = await import('./NoteList')

const mockNotes: DbNote[] = [
  {
    id: 'n1',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Hello world',
    privacy: 'shared',
    tags: ['greeting'],
    category_id: null,
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
    category_id: null,
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
]

describe('NoteList', () => {
  it('renders all notes by default', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.getByTestId('note-n2')).toBeDefined()
    expect(screen.getByTestId('note-n3')).toBeDefined()
  })

  it('filters by privacy when clicking filter buttons', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByText('Shared'))
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
    expect(screen.queryByTestId('note-n3')).toBeNull()
  })

  it('filters by search term in content', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'partner' } })
    expect(screen.queryByTestId('note-n1')).toBeNull()
    expect(screen.getByTestId('note-n2')).toBeDefined()
  })

  it('filters by search term in tags', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'greeting' } })
    expect(screen.getByTestId('note-n1')).toBeDefined()
    expect(screen.queryByTestId('note-n2')).toBeNull()
  })

  it('shows empty state when no notes match', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'nonexistent' } })
    expect(screen.getByText('No notes found')).toBeDefined()
  })

  it('only passes onDelete for own notes', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByTestId('note-n1').getAttribute('data-deletable')).toBe('true')
    expect(screen.getByTestId('note-n2').getAttribute('data-deletable')).toBe('false')
  })

  it('displays result count', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('3 notes')).toBeDefined()
  })

  it('renders sort dropdown with options', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    const select = screen.getByDisplayValue('Newest first')
    expect(select).toBeDefined()
  })

  it('shows filtered count when search is active', () => {
    render(<NoteList notes={mockNotes} currentUserId="u1" onSelect={vi.fn()} onDelete={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search notes...'), { target: { value: 'partner' } })
    expect(screen.getByText('1 note found')).toBeDefined()
  })
})
