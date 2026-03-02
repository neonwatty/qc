import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children as React.ReactNode}</button>
  ),
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: Record<string, unknown>) => (
    <button
      role="switch"
      aria-checked={Boolean(checked)}
      onClick={() => (onCheckedChange as (v: boolean) => void)(!checked)}
      {...props}
    />
  ),
}))

vi.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="icon-pencil" />,
  GripVertical: () => <span data-testid="icon-grip" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CategoryCard (settings)', () => {
  async function loadComponent() {
    const mod = await import('./CategoryCard')
    return mod.CategoryCard
  }

  const baseCategory = {
    id: 'cat-1',
    coupleId: 'couple-1',
    name: 'Emotional Health',
    description: 'Talk about feelings',
    icon: '❤️',
    isActive: true,
    isSystem: false,
    sortOrder: 1,
    prompts: [],
    createdAt: '2025-01-01T00:00:00Z',
  }

  it('renders category name', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={baseCategory} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText('Emotional Health')).toBeDefined()
  })

  it('renders category icon', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={baseCategory} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText('❤️')).toBeDefined()
  })

  it('renders category description when provided', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={baseCategory} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText('Talk about feelings')).toBeDefined()
  })

  it('does not render description when not provided', async () => {
    const CategoryCard = await loadComponent()
    const cat = { ...baseCategory, description: null }
    render(<CategoryCard category={cat} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.queryByText('Talk about feelings')).toBeNull()
  })

  it('shows System badge when isSystem is true', async () => {
    const CategoryCard = await loadComponent()
    const cat = { ...baseCategory, isSystem: true }
    render(<CategoryCard category={cat} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.getByText('System')).toBeDefined()
  })

  it('hides System badge when isSystem is false', async () => {
    const CategoryCard = await loadComponent()
    render(<CategoryCard category={baseCategory} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.queryByText('System')).toBeNull()
  })

  it('hides edit button for system categories', async () => {
    const CategoryCard = await loadComponent()
    const cat = { ...baseCategory, isSystem: true }
    render(<CategoryCard category={cat} onEdit={vi.fn()} onToggleActive={vi.fn()} />)
    expect(screen.queryByTestId('icon-pencil')).toBeNull()
  })

  it('calls onEdit when edit button clicked for non-system category', async () => {
    const CategoryCard = await loadComponent()
    const onEdit = vi.fn()
    render(<CategoryCard category={baseCategory} onEdit={onEdit} onToggleActive={vi.fn()} />)
    fireEvent.click(screen.getByTestId('icon-pencil').closest('button')!)
    expect(onEdit).toHaveBeenCalledWith(baseCategory)
  })
})
