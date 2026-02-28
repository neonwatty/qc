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
  Plus: () => <span data-testid="icon-plus" />,
  X: () => <span data-testid="icon-x" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  CardHeader: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <h3 {...(props as React.HTMLAttributes<HTMLHeadingElement>)}>{children}</h3>
  ),
}))

vi.mock('./MilestoneCreatorForm', () => ({
  MilestoneCreatorForm: (props: Record<string, unknown>) => (
    <div
      data-testid="milestone-form"
      data-submitting={String(props.isSubmitting)}
      data-has-on-close={String(typeof props.onClose === 'function')}
      data-has-on-submit={String(typeof props.onSubmit === 'function')}
      data-has-form-data={String(!!props.formData)}
      data-has-errors={String(!!props.errors)}
    />
  ),
}))

vi.mock('./milestone-creator-config', () => ({
  INITIAL_FORM: {
    title: '',
    description: '',
    category: '',
    icon: '',
    photoFile: null,
    rarity: 'common',
    points: 10,
  },
}))

const { MilestoneCreator } = await import('./MilestoneCreator')

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(async () => {}),
    isSubmitting: false,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MilestoneCreator', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(<MilestoneCreator {...defaultProps({ isOpen: false })} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders Create New Milestone title when isOpen is true', () => {
    render(<MilestoneCreator {...defaultProps()} />)
    expect(screen.getByText('Create New Milestone')).toBeDefined()
  })

  it('renders close button with X icon', () => {
    render(<MilestoneCreator {...defaultProps()} />)
    expect(screen.getByTestId('icon-x')).toBeDefined()
  })

  it('renders MilestoneCreatorForm', () => {
    render(<MilestoneCreator {...defaultProps()} />)
    expect(screen.getByTestId('milestone-form')).toBeDefined()
  })

  it('passes isSubmitting prop to MilestoneCreatorForm', () => {
    render(<MilestoneCreator {...defaultProps({ isSubmitting: true })} />)
    const form = screen.getByTestId('milestone-form')
    expect(form.getAttribute('data-submitting')).toBe('true')
  })

  it('passes formData to MilestoneCreatorForm', () => {
    render(<MilestoneCreator {...defaultProps()} />)
    const form = screen.getByTestId('milestone-form')
    expect(form.getAttribute('data-has-form-data')).toBe('true')
  })

  it('passes errors to MilestoneCreatorForm', () => {
    render(<MilestoneCreator {...defaultProps()} />)
    const form = screen.getByTestId('milestone-form')
    expect(form.getAttribute('data-has-errors')).toBe('true')
  })

  it('passes onClose handler to MilestoneCreatorForm', () => {
    render(<MilestoneCreator {...defaultProps()} />)
    const form = screen.getByTestId('milestone-form')
    expect(form.getAttribute('data-has-on-close')).toBe('true')
  })
})
