import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="icon-check-circle" />,
  Circle: () => <span data-testid="icon-circle" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Clock: () => <span data-testid="icon-clock" />,
  Edit2: () => <span data-testid="icon-edit2" />,
  Trash2: () => <span data-testid="icon-trash2" />,
}))

import { render, screen } from '@testing-library/react'
import type { LoveAction } from '@/types'

const { LoveActionCard } = await import('./LoveActionCard')

function makeAction(overrides: Partial<LoveAction> = {}): LoveAction {
  return {
    id: 'la1',
    coupleId: 'c1',
    linkedLanguageId: null,
    title: 'Write a love note',
    description: null,
    status: 'suggested',
    frequency: 'weekly',
    difficulty: 'easy',
    completedCount: 0,
    lastCompletedAt: null,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoveActionCard', () => {
  it('renders action title', () => {
    render(<LoveActionCard action={makeAction()} />)
    expect(screen.getByText('Write a love note')).toBeDefined()
  })

  it('renders description when provided', () => {
    render(<LoveActionCard action={makeAction({ description: 'A heartfelt note' })} />)
    expect(screen.getByText('A heartfelt note')).toBeDefined()
  })

  it('hides description when null', () => {
    render(<LoveActionCard action={makeAction({ description: null })} />)
    expect(screen.queryByText('A heartfelt note')).toBeNull()
  })

  it('shows status badge text', () => {
    render(<LoveActionCard action={makeAction({ status: 'planned' })} />)
    expect(screen.getByText('planned')).toBeDefined()
  })

  it('shows Mark Complete button when not completed and onComplete provided', () => {
    render(<LoveActionCard action={makeAction({ status: 'suggested' })} onComplete={vi.fn()} />)
    expect(screen.getByText('Mark Complete')).toBeDefined()
  })

  it('hides Mark Complete button when status is completed', () => {
    render(<LoveActionCard action={makeAction({ status: 'completed' })} onComplete={vi.fn()} />)
    expect(screen.queryByText('Mark Complete')).toBeNull()
  })

  it('shows linkedLanguageTitle with For: prefix when provided', () => {
    render(<LoveActionCard action={makeAction()} linkedLanguageTitle="Quality Time" />)
    expect(screen.getByText('For: Quality Time')).toBeDefined()
  })

  it('shows completion count text when completedCount > 0', () => {
    render(<LoveActionCard action={makeAction({ completedCount: 3 })} />)
    expect(screen.getByText(/Completed 3 times/)).toBeDefined()
  })
})
