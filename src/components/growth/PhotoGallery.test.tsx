import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import type { Milestone } from '@/types'

vi.mock('@/components/ui/motion', () => ({
  StaggerContainer: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const { className } = props
    return <div className={className as string}>{children}</div>
  },
  StaggerItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>>) => (
    <span {...props}>{children}</span>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Heart: () => <span data-testid="icon-heart" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Award: () => <span data-testid="icon-award" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('date-fns', () => ({
  format: () => 'Jan 15, 2025',
  parseISO: () => new Date('2025-01-15'),
}))

const { PhotoGallery } = await import('./PhotoGallery')

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'm1',
    coupleId: 'c1',
    title: 'First Photo',
    description: 'Our first memory',
    category: 'relationship',
    icon: null,
    achievedAt: '2025-01-15',
    rarity: 'common',
    points: 10,
    photoUrl: null,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PhotoGallery', () => {
  it('renders All filter button with milestone count', () => {
    const milestones = [makeMilestone({ id: 'm1' }), makeMilestone({ id: 'm2' })]
    render(<PhotoGallery milestones={milestones} />)
    expect(screen.getByText('All (2)')).toBeDefined()
  })

  it('renders Photos filter button with photo count', () => {
    const milestones = [
      makeMilestone({ id: 'm1', photoUrl: 'https://example.com/a.jpg' }),
      makeMilestone({ id: 'm2', photoUrl: null }),
    ]
    render(<PhotoGallery milestones={milestones} />)
    expect(screen.getByText('Photos (1)')).toBeDefined()
  })

  it('renders empty state when no milestones have photos or icons', () => {
    const milestones = [makeMilestone({ id: 'm1', photoUrl: null, icon: null })]
    render(<PhotoGallery milestones={milestones} />)
    expect(screen.getByText('No memories yet')).toBeDefined()
  })

  it('renders Add Memory button when onAddMemory provided', () => {
    render(<PhotoGallery milestones={[]} onAddMemory={() => {}} />)
    expect(screen.getByText('Add Memory')).toBeDefined()
  })

  it('does not render Add Memory button when onAddMemory not provided', () => {
    render(<PhotoGallery milestones={[]} />)
    expect(screen.queryByText('Add Memory')).toBeNull()
  })

  it('renders milestone image when photoUrl is set', () => {
    const milestones = [makeMilestone({ id: 'm1', photoUrl: 'https://example.com/photo.jpg' })]
    render(<PhotoGallery milestones={milestones} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('shows rarity badge when milestone rarity is not common', () => {
    const milestones = [makeMilestone({ id: 'm1', photoUrl: 'https://example.com/a.jpg', rarity: 'epic' })]
    render(<PhotoGallery milestones={milestones} />)
    expect(screen.getByText('epic')).toBeDefined()
  })

  it('calls onAddMemory when Add Memory button clicked', () => {
    const onAddMemory = vi.fn()
    render(<PhotoGallery milestones={[]} onAddMemory={onAddMemory} />)
    fireEvent.click(screen.getByText('Add Memory'))
    expect(onAddMemory).toHaveBeenCalledOnce()
  })
})
