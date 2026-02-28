import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type React from 'react'
import type { LoveLanguage, LoveAction } from '@/types'

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open?: boolean }>) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
  DialogDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  DialogFooter: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <label {...props}>{children}</label>
  ),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: Record<string, unknown>) => <textarea {...props} />,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectValue: () => null,
  SelectContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <option value={value}>{children}</option>
  ),
}))

const { AddActionDialog } = await import('./AddActionDialog')

beforeEach(() => {
  vi.clearAllMocks()
})

function makeLang(overrides: Partial<LoveLanguage> = {}): LoveLanguage {
  return {
    id: 'l1',
    coupleId: 'c1',
    userId: 'u1',
    title: 'Quality Time',
    category: 'time',
    importance: 'high',
    description: null,
    privacy: 'shared',
    examples: [],
    tags: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeAction(overrides: Partial<LoveAction> = {}): LoveAction {
  return {
    id: 'a1',
    coupleId: 'c1',
    linkedLanguageId: null,
    title: 'Existing Action',
    description: null,
    status: 'planned',
    frequency: 'once',
    difficulty: 'easy',
    completedCount: 0,
    lastCompletedAt: null,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onSubmit: vi.fn(),
  languages: [makeLang()],
  partnerLanguages: [makeLang({ id: 'l2', userId: 'u2', title: 'Words of Affirmation' })],
}

describe('AddActionDialog', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<AddActionDialog {...defaultProps} open={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders Add Love Action title when open and no editingAction', () => {
    render(<AddActionDialog {...defaultProps} />)
    expect(screen.getByText('Add Love Action')).toBeDefined()
  })

  it('renders Edit Love Action title when editingAction provided', () => {
    render(<AddActionDialog {...defaultProps} editingAction={makeAction()} />)
    expect(screen.getByText('Edit Love Action')).toBeDefined()
  })

  it('renders description text', () => {
    render(<AddActionDialog {...defaultProps} />)
    expect(screen.getByText('Create a specific action to express love')).toBeDefined()
  })

  it('renders Action Title label', () => {
    render(<AddActionDialog {...defaultProps} />)
    expect(screen.getByText('Action Title *')).toBeDefined()
  })

  it('renders Cancel and Add Action buttons', () => {
    render(<AddActionDialog {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeDefined()
    expect(screen.getByText('Add Action')).toBeDefined()
  })

  it('renders Save Changes button when editingAction provided', () => {
    render(<AddActionDialog {...defaultProps} editingAction={makeAction()} />)
    expect(screen.getByText('Save Changes')).toBeDefined()
  })

  it('renders language options from languages and partnerLanguages props', () => {
    render(<AddActionDialog {...defaultProps} />)
    expect(screen.getByText('Quality Time')).toBeDefined()
    expect(screen.getByText('Words of Affirmation (partner)')).toBeDefined()
  })
})
