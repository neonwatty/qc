import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import type { DbNote, DbCategory } from '@/types'

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

function makeCategory(overrides: Partial<DbCategory> = {}): DbCategory {
  return {
    id: 'cat1',
    couple_id: 'c1',
    name: 'Reflections',
    description: null,
    icon: '💭',
    is_active: true,
    is_system: false,
    sort_order: 0,
    prompts: [],
    created_at: new Date().toISOString(),
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

  // Select mode tests
  it('shows checkbox in select mode for own notes', () => {
    render(<NoteCard note={makeNote()} isOwn selectMode onToggleSelect={vi.fn()} />)
    expect(screen.getByLabelText('Select note')).toBeDefined()
  })

  it('does not show checkbox in select mode for partner notes', () => {
    render(<NoteCard note={makeNote()} isOwn={false} selectMode onToggleSelect={vi.fn()} />)
    expect(screen.queryByLabelText('Select note')).toBeNull()
  })

  it('applies ring-2 ring-primary when selected', () => {
    const { container } = render(<NoteCard note={makeNote()} isOwn selectMode isSelected onToggleSelect={vi.fn()} />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('ring-2')
    expect(card.className).toContain('ring-primary')
  })

  it('applies opacity-50 for partner notes in select mode', () => {
    const { container } = render(<NoteCard note={makeNote()} isOwn={false} selectMode onToggleSelect={vi.fn()} />)
    const card = container.firstElementChild as HTMLElement
    expect(card.className).toContain('opacity-50')
  })

  it('hides delete button in select mode', () => {
    render(<NoteCard note={makeNote()} isOwn selectMode onDelete={vi.fn()} onToggleSelect={vi.fn()} />)
    expect(screen.queryByLabelText('Delete note')).toBeNull()
  })

  it('calls onToggleSelect when clicking in select mode', () => {
    const onToggleSelect = vi.fn()
    const note = makeNote()
    render(<NoteCard note={note} isOwn selectMode onToggleSelect={onToggleSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggleSelect).toHaveBeenCalledWith(note.id)
  })

  // Category badge tests
  it('shows category badge when category provided', () => {
    const category = makeCategory()
    render(<NoteCard note={makeNote()} isOwn category={category} />)
    expect(screen.getByText('Reflections')).toBeDefined()
    expect(screen.getByText('💭')).toBeDefined()
  })

  it('does not show category badge when category is null', () => {
    render(<NoteCard note={makeNote()} isOwn category={null} />)
    expect(screen.queryByText('Reflections')).toBeNull()
  })
})
