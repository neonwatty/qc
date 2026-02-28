import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

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
  Input: (props: React.JSX.IntrinsicElements['input']) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <label {...props}>{children}</label>
  ),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>) => (
    <div data-value={value} data-onvaluechange={onValueChange ? 'true' : undefined}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectItem: ({ children, value, ...props }: React.PropsWithChildren<{ value: string }>) => (
    <option value={value} {...props}>
      {children}
    </option>
  ),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.JSX.IntrinsicElements['textarea']) => <textarea {...props} />,
}))

import { render, screen } from '@testing-library/react'

const { ConvertDiscoveryDialog } = await import('./ConvertDiscoveryDialog')

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  discoveryText: 'My partner loves long walks on the beach together every single evening',
  onConvert: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ConvertDiscoveryDialog', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(<ConvertDiscoveryDialog {...defaultProps} open={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog title when open is true', () => {
    render(<ConvertDiscoveryDialog {...defaultProps} />)
    expect(screen.getByText('Convert Discovery to Love Language')).toBeDefined()
  })

  it('renders dialog description text', () => {
    render(<ConvertDiscoveryDialog {...defaultProps} />)
    expect(
      screen.getByText('Transform this discovery into a structured love language profile to track and act on.'),
    ).toBeDefined()
  })

  it('renders Title and Description labels', () => {
    render(<ConvertDiscoveryDialog {...defaultProps} />)
    expect(screen.getByText('Title')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
  })

  it('shows Cancel and Convert buttons', () => {
    render(<ConvertDiscoveryDialog {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeDefined()
    expect(screen.getByText('Convert')).toBeDefined()
  })

  it('pre-fills title from discoveryText sliced to 50 chars', () => {
    render(<ConvertDiscoveryDialog {...defaultProps} />)
    const input = screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement
    expect(input.value).toBe(defaultProps.discoveryText.slice(0, 50))
  })

  it('pre-fills description from full discoveryText', () => {
    render(<ConvertDiscoveryDialog {...defaultProps} />)
    const textarea = screen.getByRole('textbox', { name: 'Description' }) as HTMLTextAreaElement
    expect(textarea.value).toBe(defaultProps.discoveryText)
  })
})
