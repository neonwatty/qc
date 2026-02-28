import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

function MotionComponent({ children, onClick, className, style, ...rest }: Record<string, unknown>) {
  const htmlProps: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(rest)) {
    if (key.startsWith('on') && key[2] && key[2] === key[2].toUpperCase()) htmlProps[key] = val
    if (key === 'data-testid') htmlProps[key] = val
  }
  return (
    <div
      onClick={onClick as React.MouseEventHandler}
      className={className as string}
      style={style as React.CSSProperties}
      {...htmlProps}
    >
      {children as React.ReactNode}
    </div>
  )
}

vi.mock('framer-motion', () => ({
  motion: { div: MotionComponent },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('class-variance-authority', () => ({
  cva: () => () => 'sheet-classes',
}))
vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  GripHorizontal: () => <span data-testid="icon-grip" />,
}))
vi.mock('@/lib/utils', () => ({ cn: (...args: unknown[]) => args.filter(Boolean).join(' ') }))
vi.mock('@/components/ui/TouchButton', () => ({
  TouchButton: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

const { MobileSheet } = await import('./MobileSheet')

beforeEach(() => {
  vi.clearAllMocks()
  document.body.style.overflow = ''
})

describe('MobileSheet', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <MobileSheet open={false} onClose={vi.fn()}>
        Content
      </MobileSheet>,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders children when open is true', () => {
    render(
      <MobileSheet open={true} onClose={vi.fn()}>
        Sheet Content
      </MobileSheet>,
    )
    expect(screen.getByText('Sheet Content')).toBeDefined()
  })

  it('renders close button by default when open', () => {
    render(
      <MobileSheet open={true} onClose={vi.fn()}>
        Content
      </MobileSheet>,
    )
    expect(screen.getByTestId('icon-x')).toBeDefined()
  })

  it('does not render close button when showCloseButton is false', () => {
    render(
      <MobileSheet open={true} onClose={vi.fn()} showCloseButton={false}>
        Content
      </MobileSheet>,
    )
    expect(screen.queryByTestId('icon-x')).toBeNull()
  })

  it('renders grip handle for bottom sheet by default', () => {
    render(
      <MobileSheet open={true} onClose={vi.fn()}>
        Content
      </MobileSheet>,
    )
    expect(screen.getByTestId('icon-grip')).toBeDefined()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <MobileSheet open={true} onClose={onClose}>
        Content
      </MobileSheet>,
    )
    const btn = screen.getByTestId('icon-x').closest('button')!
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sets body overflow hidden when open', () => {
    render(
      <MobileSheet open={true} onClose={vi.fn()}>
        Content
      </MobileSheet>,
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body overflow when closed', () => {
    const { rerender } = render(
      <MobileSheet open={true} onClose={vi.fn()}>
        Content
      </MobileSheet>,
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <MobileSheet open={false} onClose={vi.fn()}>
        Content
      </MobileSheet>,
    )
    expect(document.body.style.overflow).toBe('unset')
  })
})
