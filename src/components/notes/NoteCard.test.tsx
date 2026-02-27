import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { DbNote } from '@/types'

vi.mock('./PrivacyBadge', () => ({
  PrivacyBadge: (props: Record<string, unknown>) => <span data-testid="privacy-badge">{String(props.privacy)}</span>,
}))

const { NoteCard } = await import('./NoteCard')

function makeNote(overrides: Partial<DbNote> = {}): DbNote {
  return {
    id: 'n1',
    couple_id: 'c1',
    author_id: 'u1',
    check_in_id: null,
    content: 'Test note content',
    privacy: 'shared' as const,
    tags: [],
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('NoteCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders note content', () => {
    render(<NoteCard note={makeNote({ content: 'My important note' })} isOwn />)
    expect(screen.getByText('My important note')).toBeDefined()
  })

  it('shows PrivacyBadge with correct privacy', () => {
    render(<NoteCard note={makeNote({ privacy: 'private' })} isOwn />)
    expect(screen.getByTestId('privacy-badge').textContent).toBe('private')
  })

  it('shows "You" when isOwn=true', () => {
    render(<NoteCard note={makeNote()} isOwn />)
    expect(screen.getByText('You')).toBeDefined()
  })

  it('shows "Partner" when isOwn=false', () => {
    render(<NoteCard note={makeNote()} isOwn={false} />)
    expect(screen.getByText('Partner')).toBeDefined()
  })

  it('calls onSelect when card clicked', () => {
    const note = makeNote()
    const onSelect = vi.fn()
    render(<NoteCard note={note} isOwn onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(note)
  })

  it('shows delete button only when isOwn=true AND onDelete provided', () => {
    const onDelete = vi.fn()
    render(<NoteCard note={makeNote()} isOwn onDelete={onDelete} />)
    expect(screen.getByLabelText('Delete note')).toBeDefined()
  })

  it('hides delete button when isOwn=false', () => {
    render(<NoteCard note={makeNote()} isOwn={false} onDelete={vi.fn()} />)
    expect(screen.queryByLabelText('Delete note')).toBeNull()
  })

  it('shows tags as "#tag" (max 3) with "+N" overflow', () => {
    const note = makeNote({ tags: ['love', 'growth', 'goals', 'fun', 'date'] })
    render(<NoteCard note={note} isOwn />)
    expect(screen.getByText('#love')).toBeDefined()
    expect(screen.getByText('#growth')).toBeDefined()
    expect(screen.getByText('#goals')).toBeDefined()
    expect(screen.queryByText('#fun')).toBeNull()
    expect(screen.getByText('+2')).toBeDefined()
  })

  it('shows "Today" for notes created today', () => {
    render(<NoteCard note={makeNote({ created_at: new Date().toISOString() })} isOwn />)
    expect(screen.getByText('Today')).toBeDefined()
  })
})
