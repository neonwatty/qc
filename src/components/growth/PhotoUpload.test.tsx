import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => {
  function MotionDiv(props: Record<string, unknown>) {
    const { children, initial, animate, exit, transition, whileHover, whileTap, ...rest } = props
    void initial
    void animate
    void exit
    void transition
    void whileHover
    void whileTap
    return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
  }
  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  }
})

vi.mock('lucide-react', () => ({
  Camera: () => <span data-testid="icon-camera" />,
  Upload: () => <span data-testid="icon-upload" />,
  X: () => <span data-testid="icon-x" />,
  Image: () => <span data-testid="icon-image" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  Check: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}))

const { PhotoUpload } = await import('./PhotoUpload')

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    onFileSelect: vi.fn(),
    onEmojiSelect: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PhotoUpload', () => {
  it('renders placeholder text in default variant when no value', () => {
    render(<PhotoUpload {...defaultProps()} />)
    expect(screen.getByText('Add a photo to commemorate this milestone')).toBeDefined()
  })

  it('renders Upload Photo button in default variant', () => {
    render(<PhotoUpload {...defaultProps()} />)
    expect(screen.getByText('Upload Photo')).toBeDefined()
  })

  it('renders Emoji button in default variant', () => {
    render(<PhotoUpload {...defaultProps()} />)
    expect(screen.getByText('Emoji')).toBeDefined()
  })

  it('renders Photo added text when value is a URL', () => {
    render(<PhotoUpload {...defaultProps({ value: 'https://example.com/photo.jpg' })} />)
    expect(screen.getByText('Photo added')).toBeDefined()
  })

  it('renders remove button when value is set', () => {
    render(<PhotoUpload {...defaultProps({ value: 'https://example.com/photo.jpg' })} />)
    expect(screen.getByTestId('icon-x')).toBeDefined()
  })

  it('renders Uploading text when isUploading is true in default variant', () => {
    render(<PhotoUpload {...defaultProps({ isUploading: true })} />)
    expect(screen.getByText('Uploading...')).toBeDefined()
  })

  it('renders Upload button in minimal variant when no value', () => {
    render(<PhotoUpload {...defaultProps({ variant: 'minimal' })} />)
    expect(screen.getByText('Upload')).toBeDefined()
  })

  it('renders Photo selected text in minimal variant when value is set', () => {
    render(<PhotoUpload {...defaultProps({ variant: 'minimal', value: 'https://example.com/photo.jpg' })} />)
    expect(screen.getByText('Photo selected')).toBeDefined()
  })
})
