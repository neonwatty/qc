import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

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
  Input: (props: Record<string, unknown>) => <input {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <label {...props}>{children}</label>
  ),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: Record<string, unknown>) => (
    <textarea {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
  ),
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

vi.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  RadioGroupItem: (props: Record<string, unknown>) => (
    <input type="radio" {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
  ),
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
}))

vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  X: () => <span data-testid="icon-x" />,
}))

import { render, screen } from '@testing-library/react'
import type { LoveLanguage } from '@/types'

const { AddLanguageDialog } = await import('./AddLanguageDialog')

const INITIAL_LANGUAGE: LoveLanguage = {
  id: 'l1',
  coupleId: 'c1',
  userId: 'u1',
  title: 'Quality Time',
  category: 'time' as const,
  importance: 'medium' as const,
  description: 'Spending time together',
  privacy: 'shared' as const,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  examples: ['walks'],
  tags: ['daily'],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddLanguageDialog', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<AddLanguageDialog open={false} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders "Add Love Language" title when open and no initialLanguage', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Love Language/ })).toBeDefined()
  })

  it('renders "Edit Love Language" title when initialLanguage provided', () => {
    render(
      <AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} initialLanguage={INITIAL_LANGUAGE} />,
    )
    expect(screen.getByText('Edit Love Language')).toBeDefined()
  })

  it('renders description text', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Describe a specific way you feel loved and appreciated')).toBeDefined()
  })

  it('renders "Title *" label', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Title *')).toBeDefined()
  })

  it('renders Cancel and "Add Love Language" buttons', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Cancel')).toBeDefined()
    expect(screen.getAllByText('Add Love Language').length).toBeGreaterThanOrEqual(1)
  })

  it('renders "Save Changes" when initialLanguage provided', () => {
    render(
      <AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} initialLanguage={INITIAL_LANGUAGE} />,
    )
    expect(screen.getByText('Save Changes')).toBeDefined()
  })

  it('renders importance radio labels: Low, Medium, High, Essential', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Low')).toBeDefined()
    expect(screen.getByText('Medium')).toBeDefined()
    expect(screen.getByText('High')).toBeDefined()
    expect(screen.getByText('Essential')).toBeDefined()
  })

  it('renders descriptive help text for importance levels', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Nice to have')).toBeDefined()
    expect(screen.getByText('Important to me')).toBeDefined()
    expect(screen.getByText('Very important')).toBeDefined()
    expect(screen.getByText('Critical for feeling loved')).toBeDefined()
  })

  it('renders descriptive help text for privacy options', () => {
    render(<AddLanguageDialog open={true} onOpenChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Only visible to me')).toBeDefined()
    expect(screen.getByText('Visible to your partner')).toBeDefined()
  })
})
