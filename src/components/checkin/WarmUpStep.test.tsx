import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

const mockCompleteStep = vi.fn()
const mockGoToStep = vi.fn()

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => {
      const { initial, animate, exit, transition, whileHover, whileTap, variants, ...htmlProps } = props as Record<
        string,
        unknown
      >
      void initial
      void animate
      void exit
      void transition
      void whileHover
      void whileTap
      void variants
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  Shuffle: () => <span data-testid="icon-shuffle" />,
  SkipForward: () => <span data-testid="icon-skip" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('@/components/ui/motion', () => ({
  MotionBox: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => {
    const { variant, size, asChild, animated, ...htmlProps } = props as Record<string, unknown>
    void variant
    void size
    void asChild
    void animated
    return <button {...(htmlProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
  },
}))

vi.mock('@/components/checkin/NavigationControls', () => ({
  NavigationControls: () => <div data-testid="navigation-controls" />,
}))

vi.mock('@/contexts/CheckInContext', () => ({
  useCheckInContext: () => ({ completeStep: mockCompleteStep, goToStep: mockGoToStep }),
}))

vi.mock('@/lib/warmup-prompts', () => ({
  pickThreePrompts: vi.fn(() => [
    { id: 'p1', text: 'What made you smile today?', tone: 'light' },
    { id: 'p2', text: 'How are you feeling right now?', tone: 'medium' },
    { id: 'p3', text: 'What do you need from me this week?', tone: 'deep' },
  ]),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { tap: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('WarmUpStep', () => {
  async function loadComponent() {
    const mod = await import('./WarmUpStep')
    return mod.WarmUpStep
  }

  it('renders heading', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByText('Warm-Up Questions')).toBeDefined()
  })

  it('renders subtext about picking a question', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByText('Pick a question to get the conversation flowing, or skip ahead.')).toBeDefined()
  })

  it('renders Shuffle button text', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByText('Shuffle')).toBeDefined()
  })

  it('renders Skip button text', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByText('Skip')).toBeDefined()
  })

  it('renders all 3 prompt texts', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByText('What made you smile today?')).toBeDefined()
    expect(screen.getByText('How are you feeling right now?')).toBeDefined()
    expect(screen.getByText('What do you need from me this week?')).toBeDefined()
  })

  it('renders tone labels', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByText('Light')).toBeDefined()
    expect(screen.getByText('Medium')).toBeDefined()
    expect(screen.getByText('Deep')).toBeDefined()
  })

  it('renders NavigationControls', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    expect(screen.getByTestId('navigation-controls')).toBeDefined()
  })

  it('calls completeStep when Skip is clicked', async () => {
    const WarmUpStep = await loadComponent()
    render(<WarmUpStep />)
    fireEvent.click(screen.getByText('Skip'))
    expect(mockCompleteStep).toHaveBeenCalledWith('warm-up')
  })
})
