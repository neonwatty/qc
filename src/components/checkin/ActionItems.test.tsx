import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import React from 'react'
import type { ActionItem } from '@/types'

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
  Plus: () => <span data-testid="plus-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  Check: () => <span data-testid="check-icon" />,
  Calendar: () => <span data-testid="calendar-icon" />,
  User: () => <span data-testid="user-icon" />,
  ChevronRight: () => <span data-testid="chevron-right" />,
}))

vi.mock('@/components/ui/motion', () => ({
  MotionBox: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const { variant, delay, ...htmlProps } = props
    void variant
    void delay
    return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  },
  StaggerContainer: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const { staggerDelay, ...htmlProps } = props
    void staggerDelay
    return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  },
  StaggerItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

const items: ActionItem[] = [
  {
    id: 'a1',
    coupleId: 'c1',
    checkInId: null,
    title: 'Plan date night',
    description: null,
    assignedTo: null,
    dueDate: null,
    completed: false,
    completedAt: null,
    createdAt: '2025-01-01',
  },
  {
    id: 'a2',
    coupleId: 'c1',
    checkInId: null,
    title: 'Buy flowers',
    description: 'Red roses',
    assignedTo: 'user1',
    dueDate: '2025-02-14',
    completed: true,
    completedAt: '2025-02-10',
    createdAt: '2025-01-02',
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ActionItems', () => {
  async function loadComponent() {
    const mod = await import('./ActionItems')
    return mod.ActionItems
  }

  function defaultProps(overrides: Record<string, unknown> = {}) {
    return {
      actionItems: items,
      onAddActionItem: vi.fn(),
      onRemoveActionItem: vi.fn(),
      onToggleActionItem: vi.fn(),
      coupleId: 'c1',
      ...overrides,
    }
  }

  it('renders heading and description', async () => {
    const ActionItems = await loadComponent()
    render(<ActionItems {...defaultProps()} />)

    expect(screen.getByText('Action Items')).toBeDefined()
    expect(screen.getByText('Create actionable next steps to strengthen your relationship')).toBeDefined()
  })

  it('renders all action items with titles', async () => {
    const ActionItems = await loadComponent()
    render(<ActionItems {...defaultProps()} />)

    expect(screen.getByText('Plan date night')).toBeDefined()
    expect(screen.getByText('Buy flowers')).toBeDefined()
  })

  it('shows "Add Action Item" button initially, not the input form', async () => {
    const ActionItems = await loadComponent()
    render(<ActionItems {...defaultProps()} />)

    const addButtons = screen.getAllByText('Add Action Item')
    expect(addButtons).toHaveLength(1)
    expect(screen.queryByPlaceholderText('e.g., Plan a date night')).toBeNull()
  })

  it('clicking "Add Action Item" shows input and submit/cancel buttons', async () => {
    const ActionItems = await loadComponent()
    render(<ActionItems {...defaultProps()} />)

    fireEvent.click(screen.getByText('Add Action Item'))

    expect(screen.getByPlaceholderText('e.g., Plan a date night')).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
    // The button text in the form is also "Add Action Item"
    expect(screen.getByText('Add Action Item')).toBeDefined()
  })

  it('adding item calls onAddActionItem with correct payload and clears input', async () => {
    const ActionItems = await loadComponent()
    const onAdd = vi.fn()
    render(<ActionItems {...defaultProps({ onAddActionItem: onAdd })} />)

    // Open the form
    fireEvent.click(screen.getByText('Add Action Item'))

    // Type in the input
    const input = screen.getByPlaceholderText('e.g., Plan a date night')
    fireEvent.change(input, { target: { value: '  Write love letter  ' } })

    // Press Enter to submit
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onAdd).toHaveBeenCalledWith({
      coupleId: 'c1',
      checkInId: null,
      title: 'Write love letter',
      description: null,
      assignedTo: null,
      dueDate: null,
      completed: false,
      completedAt: null,
    })

    // Form should be hidden after submission
    expect(screen.queryByPlaceholderText('e.g., Plan a date night')).toBeNull()
  })

  it('cancel hides form and clears input', async () => {
    const ActionItems = await loadComponent()
    render(<ActionItems {...defaultProps()} />)

    // Open the form
    fireEvent.click(screen.getByText('Add Action Item'))

    // Type something
    const input = screen.getByPlaceholderText('e.g., Plan a date night')
    fireEvent.change(input, { target: { value: 'Some text' } })

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Form should be hidden
    expect(screen.queryByPlaceholderText('e.g., Plan a date night')).toBeNull()
  })

  it('shows summary with correct counts', async () => {
    const ActionItems = await loadComponent()
    render(<ActionItems {...defaultProps()} />)

    expect(screen.getByText('2 action items created')).toBeDefined()
    expect(screen.getByText(/1 completed, 1 remaining/)).toBeDefined()
  })

  it('toggle button calls onToggleActionItem with item id', async () => {
    const ActionItems = await loadComponent()
    const onToggle = vi.fn()
    render(<ActionItems {...defaultProps({ onToggleActionItem: onToggle })} />)

    // The toggle button is the round button containing the check icon for a completed item
    // Each item has a toggle button (the circle) as the first button in the item row
    // Find the item "Plan date night" and click its toggle
    const planItem = screen.getByText('Plan date night').closest('[class*="flex items-start"]')!
    const toggleButton = planItem.querySelector('button')!
    fireEvent.click(toggleButton)

    expect(onToggle).toHaveBeenCalledWith('a1')
  })

  it('remove button calls onRemoveActionItem with item id', async () => {
    const ActionItems = await loadComponent()
    const onRemove = vi.fn()
    render(<ActionItems {...defaultProps({ onRemoveActionItem: onRemove })} />)

    // Remove buttons have aria-label "Remove action item"
    const removeButtons = screen.getAllByLabelText('Remove action item')
    fireEvent.click(removeButtons[0])

    expect(onRemove).toHaveBeenCalledWith('a1')
  })
})
