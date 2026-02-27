import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...htmlProps } = props as Record<
        string,
        unknown
      >
      void initial
      void animate
      void exit
      void transition
      void whileHover
      void whileTap
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    },
  },
}))

vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="icon-arrow" />,
  Check: () => <span data-testid="icon-check" />,
  Clock: () => <span data-testid="icon-clock" />,
  Edit: () => <span data-testid="icon-edit" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CategoryCard', () => {
  async function loadComponent() {
    const mod = await import('./CategoryCard')
    return mod.CategoryCard
  }

  const category = { id: 'cat-1', name: 'Communication', description: 'Discuss openly', icon: '💬' }

  it('renders category name and description', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={category} onSelect={vi.fn()} />)
    expect(screen.getByText('Communication')).toBeDefined()
    expect(screen.getByText('Discuss openly')).toBeDefined()
  })

  it('shows category icon', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={category} onSelect={vi.fn()} />)
    expect(screen.getByText('💬')).toBeDefined()
  })

  it('calls onSelect with category id when clicked', async () => {
    const CategoryCard = await loadComponent()
    const onSelect = vi.fn()
    render(<CategoryCard category={category} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Communication'))
    expect(onSelect).toHaveBeenCalledWith('cat-1')
  })

  it('shows check badge when isCompleted=true', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={category} onSelect={vi.fn()} isCompleted />)
    expect(screen.getByTestId('icon-check')).toBeDefined()
  })

  it('hides check badge when isCompleted=false', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={category} onSelect={vi.fn()} isCompleted={false} />)
    expect(screen.queryByTestId('icon-check')).toBeNull()
  })

  it('shows time spent when progress.timeSpent > 0', async () => {
    const CategoryCard = await loadComponent()
    const progress = { categoryId: 'cat-1', isCompleted: false, notes: [], timeSpent: 300000, lastUpdated: '' }
    render(<CategoryCard category={category} onSelect={vi.fn()} progress={progress} />)
    expect(screen.getByText('5 min')).toBeDefined()
    expect(screen.getByTestId('icon-clock')).toBeDefined()
  })

  it('shows note count when progress.notes has items', async () => {
    const CategoryCard = await loadComponent()
    const notes = [
      {
        id: '1',
        coupleId: 'c',
        authorId: 'a',
        checkInId: null,
        content: 'x',
        privacy: 'shared' as const,
        tags: [],
        categoryId: null,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        coupleId: 'c',
        authorId: 'a',
        checkInId: null,
        content: 'y',
        privacy: 'shared' as const,
        tags: [],
        categoryId: null,
        createdAt: '',
        updatedAt: '',
      },
    ]
    const progress = { categoryId: 'cat-1', isCompleted: false, notes, timeSpent: 0, lastUpdated: '' }
    render(<CategoryCard category={category} onSelect={vi.fn()} progress={progress} />)
    expect(screen.getByText('2 notes')).toBeDefined()
    expect(screen.getByTestId('icon-edit')).toBeDefined()
  })

  it('hides progress section when no timeSpent and no notes', async () => {
    const CategoryCard = await loadComponent()
    const progress = { categoryId: 'cat-1', isCompleted: false, notes: [], timeSpent: 0, lastUpdated: '' }
    render(<CategoryCard category={category} onSelect={vi.fn()} progress={progress} />)
    expect(screen.queryByTestId('icon-clock')).toBeNull()
    expect(screen.queryByTestId('icon-edit')).toBeNull()
  })
})
