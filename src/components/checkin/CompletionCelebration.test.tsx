import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

function MotionComponent(props: Record<string, unknown>) {
  const { children, initial, animate, exit, transition, whileHover, whileTap, style, ...rest } = props
  void initial
  void animate
  void exit
  void transition
  void whileHover
  void whileTap
  return (
    <div style={style as React.CSSProperties | undefined} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
      {children as React.ReactNode}
    </div>
  )
}

vi.mock('framer-motion', () => ({
  motion: {
    div: MotionComponent,
    h2: MotionComponent,
    p: MotionComponent,
    span: MotionComponent,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  Sparkles: () => <span data-testid="icon-sparkles" />,
  Trophy: () => <span data-testid="icon-trophy" />,
  Home: () => <span data-testid="icon-home" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Smile: () => <span data-testid="icon-smile" />,
  Meh: () => <span data-testid="icon-meh" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/lib/confetti', () => ({
  celebrationBurst: vi.fn(),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { checkInComplete: vi.fn() },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

vi.mock('@/hooks/useCountUp', () => ({
  useCountUp: vi.fn((value: number) => value),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CompletionCelebration', () => {
  async function loadComponent() {
    const mod = await import('./CompletionCelebration')
    return mod.CompletionCelebration
  }

  it('renders nothing when show is false', async () => {
    const CompletionCelebration = await loadComponent()
    const { container } = render(<CompletionCelebration show={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders "Check-in Complete!" heading when show is true', async () => {
    const CompletionCelebration = await loadComponent()
    render(<CompletionCelebration show />)
    expect(screen.getByText('Check-in Complete!')).toBeDefined()
  })

  it('renders subtext when show is true', async () => {
    const CompletionCelebration = await loadComponent()
    render(<CompletionCelebration show />)
    expect(screen.getByText('Great job taking time for your relationship!')).toBeDefined()
  })

  it('renders "Go Home" button when onGoHome is provided', async () => {
    const CompletionCelebration = await loadComponent()
    render(<CompletionCelebration show onGoHome={vi.fn()} />)
    expect(screen.getByText('Go Home')).toBeDefined()
  })

  it('renders "Start Another" button when onStartNew is provided', async () => {
    const CompletionCelebration = await loadComponent()
    render(<CompletionCelebration show onStartNew={vi.fn()} />)
    expect(screen.getByText('Start Another')).toBeDefined()
  })

  it('renders "Close" button when onClose is provided', async () => {
    const CompletionCelebration = await loadComponent()
    render(<CompletionCelebration show onClose={vi.fn()} />)
    expect(screen.getByText('Close')).toBeDefined()
  })

  it('renders "7 days" recommended check-in text', async () => {
    const CompletionCelebration = await loadComponent()
    render(<CompletionCelebration show />)
    expect(screen.getByText('Your next check-in is recommended in')).toBeDefined()
    expect(screen.getByText('7 days')).toBeDefined()
  })

  it('calls onGoHome when "Go Home" button is clicked', async () => {
    const CompletionCelebration = await loadComponent()
    const onGoHome = vi.fn()
    render(<CompletionCelebration show onGoHome={onGoHome} />)
    fireEvent.click(screen.getByText('Go Home'))
    expect(onGoHome).toHaveBeenCalledOnce()
  })
})
