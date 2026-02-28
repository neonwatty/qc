import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: Record<string, unknown>) => (
      <div {...Object.fromEntries(Object.entries(rest).filter(([k]) => !k.startsWith('while') && k !== 'transition'))}>
        {children as React.ReactNode}
      </div>
    ),
  },
}))
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: Record<string, unknown>) => <span {...props}>{children as React.ReactNode}</span>,
}))
vi.mock('@/lib/utils', () => ({ cn: (...args: unknown[]) => args.filter(Boolean).join(' ') }))
vi.mock('@/lib/touch-interactions', () => ({
  optimizeForTouch: vi.fn(() => vi.fn()),
  ensureTouchTarget: vi.fn(),
}))
vi.mock('@/lib/haptics', () => ({ hapticFeedback: { tap: vi.fn() } }))

const { TouchButton, FAB } = await import('./TouchButton')
const { hapticFeedback } = await import('@/lib/haptics')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TouchButton', () => {
  it('renders button with children text', () => {
    render(<TouchButton>Click Me</TouchButton>)
    expect(screen.getByText('Click Me')).toBeDefined()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<TouchButton onClick={onClick}>Press</TouchButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading spinner when loading is true', () => {
    const { container } = render(<TouchButton loading>Save</TouchButton>)
    expect(container.querySelector('.animate-spin')).not.toBeNull()
  })

  it('disables button when loading', () => {
    render(<TouchButton loading>Save</TouchButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders left icon when provided', () => {
    render(<TouchButton leftIcon={<span data-testid="left-icon" />}>Go</TouchButton>)
    expect(screen.getByTestId('left-icon')).toBeDefined()
  })

  it('renders right icon when provided', () => {
    render(<TouchButton rightIcon={<span data-testid="right-icon" />}>Go</TouchButton>)
    expect(screen.getByTestId('right-icon')).toBeDefined()
  })

  it('FAB renders with fixed positioning class', () => {
    render(<FAB>+</FAB>)
    const btn = screen.getByRole('button')
    const wrapper = btn.closest('[class]')!
    const classes = wrapper.className + ' ' + btn.className
    expect(classes).toContain('fixed')
  })

  it('calls hapticFeedback.tap when hapticFeedback prop is set', () => {
    render(
      <TouchButton hapticFeedback="light" onClick={vi.fn()}>
        Tap
      </TouchButton>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(hapticFeedback.tap).toHaveBeenCalledTimes(1)
  })
})
