import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => {
      const { initial, animate, exit, transition, whileHover, whileTap, variants, ...htmlProps } = props as Record<
        string,
        unknown
      >
      void initial
      void animate
      void exit
      void transition
      void whileHover
      void whileTap
      void variants
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right" />,
  CheckCircle: () => <span data-testid="check-circle" />,
  Users: () => <span data-testid="users-icon" />,
}))

vi.mock('@/components/ui/motion', () => ({
  StaggerContainer: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}))

vi.mock('./CategoryCard', () => ({
  CategoryCard: (props: Record<string, unknown>) => {
    const cat = props.category as { id: string; name: string }
    return (
      <div
        data-testid={`category-card-${cat.id}`}
        data-selected={String(props.isSelected)}
        data-completed={String(props.isCompleted)}
        onClick={() => (props.onSelect as (id: string) => void)(cat.id)}
      >
        {cat.name}
      </div>
    )
  },
}))

const categories = [
  { id: 'c1', name: 'Communication', description: 'Talk', icon: '💬', order: 2 },
  { id: 'c2', name: 'Growth', description: 'Grow', icon: '🌱', order: 1 },
  { id: 'c3', name: 'Intimacy', description: 'Connect', icon: '❤️', order: 3 },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CategoryGrid', () => {
  async function loadComponent() {
    const mod = await import('./CategoryGrid')
    return mod.CategoryGrid
  }

  it('renders all category cards sorted by order', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()

    render(<CategoryGrid categories={categories} onCategorySelect={onSelect} />)

    const cards = screen.getAllByTestId(/^category-card-/)
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveTextContent('Growth')
    expect(cards[1]).toHaveTextContent('Communication')
    expect(cards[2]).toHaveTextContent('Intimacy')
  })

  it('shows "Choose categories to discuss" when multiSelect with no selections', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()

    render(<CategoryGrid categories={categories} onCategorySelect={onSelect} multiSelect selectedCategories={[]} />)

    expect(screen.getByText('Choose categories to discuss')).toBeDefined()
  })

  it('shows "2 categories selected" when multiSelect with 2 selected', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()

    render(
      <CategoryGrid
        categories={categories}
        onCategorySelect={onSelect}
        multiSelect
        selectedCategories={['c1', 'c2']}
      />,
    )

    expect(screen.getByText('2 categories selected')).toBeDefined()
  })

  it('calls onCategorySelect when card is clicked', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()

    render(<CategoryGrid categories={categories} onCategorySelect={onSelect} />)

    fireEvent.click(screen.getByTestId('category-card-c1'))
    expect(onSelect).toHaveBeenCalledWith('c1')
  })

  it('blocks selection at maxSelections', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()

    render(
      <CategoryGrid
        categories={categories}
        onCategorySelect={onSelect}
        multiSelect
        selectedCategories={['c1', 'c2']}
        maxSelections={2}
      />,
    )

    fireEvent.click(screen.getByTestId('category-card-c3'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('shows "Start Discussion" button when selections exist and onStartCheckIn provided', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()
    const onStart = vi.fn()

    render(
      <CategoryGrid
        categories={categories}
        onCategorySelect={onSelect}
        selectedCategories={['c1']}
        onStartCheckIn={onStart}
      />,
    )

    expect(screen.getByText('Start Discussion')).toBeDefined()
  })

  it('shows estimated time based on selection count', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()
    const onStart = vi.fn()

    render(
      <CategoryGrid
        categories={categories}
        onCategorySelect={onSelect}
        selectedCategories={['c1', 'c2']}
        onStartCheckIn={onStart}
      />,
    )

    expect(screen.getByText('Estimated time: 6-10 minutes')).toBeDefined()
  })

  it('shows progress when showProgress and completedCount > 0', async () => {
    const CategoryGrid = await loadComponent()
    const onSelect = vi.fn()

    render(
      <CategoryGrid
        categories={categories}
        onCategorySelect={onSelect}
        multiSelect
        showProgress
        selectedCategories={['c1']}
        completedCategories={['c2']}
      />,
    )

    expect(screen.getByText('1 of 3 completed')).toBeDefined()
  })
})
