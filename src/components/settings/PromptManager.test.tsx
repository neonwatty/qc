import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

const defaultCategories = [
  {
    id: 'cat1',
    coupleId: 'c1',
    name: 'Communication',
    description: null,
    icon: '💬',
    isActive: true,
    isSystem: false,
    sortOrder: 0,
    prompts: ['How was your day?'],
    createdAt: '',
  },
  {
    id: 'cat2',
    coupleId: 'c1',
    name: 'Intimacy',
    description: null,
    icon: '❤️',
    isActive: true,
    isSystem: false,
    sortOrder: 1,
    prompts: [],
    createdAt: '',
  },
]

vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  GripVertical: () => <span data-testid="icon-grip" />,
}))

vi.mock('framer-motion', () => ({
  Reorder: {
    Group: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="reorder-group" className={className}>
        {children}
      </div>
    ),
    Item: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div data-testid="reorder-item" className={className}>
        {children}
      </div>
    ),
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

vi.mock('@/app/(app)/settings/actions/prompts', () => ({
  updateCategoryPrompts: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({ categories: defaultCategories, isLoading: false })),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({})),
}))

import { PromptManager } from './PromptManager'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PromptManager', () => {
  it('renders heading', () => {
    render(<PromptManager coupleId="c1" />)
    expect(screen.getByText('Discussion Prompts')).toBeDefined()
  })

  it('renders category pills', () => {
    render(<PromptManager coupleId="c1" />)
    expect(screen.getByText('💬 Communication')).toBeDefined()
    expect(screen.getByText('❤️ Intimacy')).toBeDefined()
  })

  it('shows prompts for first category', () => {
    render(<PromptManager coupleId="c1" />)
    expect(screen.getByText('How was your day?')).toBeDefined()
  })

  it('switches prompts on category change', () => {
    render(<PromptManager coupleId="c1" />)
    fireEvent.click(screen.getByText('❤️ Intimacy'))
    expect(screen.getByText('No prompts yet. Add one below to get started.')).toBeDefined()
  })

  it('adds a prompt via input', () => {
    render(<PromptManager coupleId="c1" />)
    const input = screen.getByPlaceholderText('Type a new prompt...')
    fireEvent.change(input, { target: { value: 'New prompt' } })
    fireEvent.click(screen.getByText('Add'))
    expect(screen.getByText('New prompt')).toBeDefined()
  })

  it('adds a prompt on Enter key', () => {
    render(<PromptManager coupleId="c1" />)
    const input = screen.getByPlaceholderText('Type a new prompt...')
    fireEvent.change(input, { target: { value: 'Enter prompt' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Enter prompt')).toBeDefined()
  })

  it('removes a prompt', () => {
    render(<PromptManager coupleId="c1" />)
    fireEvent.click(screen.getByLabelText('Remove prompt: How was your day?'))
    expect(screen.queryByText('How was your day?')).toBeNull()
  })

  it('renders Save Prompts button', () => {
    render(<PromptManager coupleId="c1" />)
    expect(screen.getByText('Save Prompts')).toBeDefined()
  })

  it('shows empty state when no categories', async () => {
    const { useCategories } = await import('@/hooks/useCategories')
    vi.mocked(useCategories).mockReturnValueOnce({ categories: [], isLoading: false })
    render(<PromptManager coupleId="c1" />)
    expect(screen.getByText('No categories available.')).toBeDefined()
  })

  it('disables Add button when input is empty', () => {
    render(<PromptManager coupleId="c1" />)
    const addButton = screen.getByText('Add').closest('button')
    expect(addButton?.disabled).toBe(true)
  })
})
