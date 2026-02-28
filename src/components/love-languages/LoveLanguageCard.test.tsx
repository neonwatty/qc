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
  Heart: () => <span data-testid="icon-heart" />,
  Lock: () => <span data-testid="icon-lock" />,
  Unlock: () => <span data-testid="icon-unlock" />,
  Edit2: () => <span data-testid="icon-edit2" />,
  Trash2: () => <span data-testid="icon-trash2" />,
  Star: () => <span data-testid="icon-star" />,
}))

import { render, screen, fireEvent } from '@testing-library/react'
import type { LoveLanguage } from '@/types'

const { LoveLanguageCard } = await import('./LoveLanguageCard')

function makeLang(overrides: Partial<LoveLanguage> = {}): LoveLanguage {
  return {
    id: 'll1',
    coupleId: 'c1',
    userId: 'u1',
    title: 'Words of Affirmation',
    description: null,
    category: 'words',
    privacy: 'shared',
    importance: 'high',
    examples: [],
    tags: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoveLanguageCard', () => {
  it('renders language title', () => {
    render(<LoveLanguageCard language={makeLang()} />)
    expect(screen.getByText('Words of Affirmation')).toBeDefined()
  })

  it('renders category icon for known category', () => {
    render(<LoveLanguageCard language={makeLang({ category: 'words' })} />)
    expect(screen.getByText('\uD83D\uDCAC')).toBeDefined()
  })

  it('renders description when provided', () => {
    render(<LoveLanguageCard language={makeLang({ description: 'Kind words matter' })} />)
    expect(screen.getByText('Kind words matter')).toBeDefined()
  })

  it('hides description when null', () => {
    render(<LoveLanguageCard language={makeLang({ description: null })} />)
    expect(screen.queryByText('Kind words matter')).toBeNull()
  })

  it('renders importance badge text', () => {
    render(<LoveLanguageCard language={makeLang({ importance: 'essential' })} />)
    expect(screen.getByText('essential')).toBeDefined()
  })

  it('shows Edit and Delete buttons when isOwn=true with callbacks', () => {
    render(<LoveLanguageCard language={makeLang()} isOwn onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Edit')).toBeDefined()
    expect(screen.getByTestId('icon-trash2')).toBeDefined()
  })

  it('hides Edit/Delete when isOwn=false, shows Suggest Action when onCreateAction provided', () => {
    render(<LoveLanguageCard language={makeLang()} isOwn={false} onCreateAction={vi.fn()} />)
    expect(screen.queryByText('Edit')).toBeNull()
    expect(screen.getByText('Suggest Action')).toBeDefined()
  })

  it('calls onTogglePrivacy when privacy toggle clicked', () => {
    const onToggle = vi.fn()
    render(<LoveLanguageCard language={makeLang({ privacy: 'private' })} isOwn onTogglePrivacy={onToggle} />)
    fireEvent.click(screen.getByTitle('Make visible to partner'))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
