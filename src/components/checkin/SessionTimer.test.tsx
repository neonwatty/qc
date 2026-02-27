import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

const mockUseSessionTimer = vi.fn()

vi.mock('@/hooks/useSessionTimer', () => ({
  useSessionTimer: (...args: unknown[]) => mockUseSessionTimer(...args),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { warning: vi.fn(), tap: vi.fn() },
}))

vi.mock('@/lib/animations', () => ({
  SPRING_CONFIGS: { snappy: { type: 'spring', stiffness: 500, damping: 30 } },
}))

vi.mock('framer-motion', () => {
  function MotionDiv({ children, ...props }: Record<string, unknown>) {
    const { initial, animate, exit, transition, whileTap, ...htmlProps } = props
    void initial
    void animate
    void exit
    void transition
    void whileTap
    return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children as React.ReactNode}</div>
  }

  function MotionSpan({ children, ...props }: Record<string, unknown>) {
    const { initial, animate, exit, transition, whileTap, ...htmlProps } = props
    void initial
    void animate
    void exit
    void transition
    void whileTap
    return <span {...(htmlProps as React.HTMLAttributes<HTMLSpanElement>)}>{children as React.ReactNode}</span>
  }

  function MotionButton({ children, ...props }: Record<string, unknown>) {
    const { initial, animate, exit, transition, whileTap, ...htmlProps } = props
    void initial
    void animate
    void exit
    void transition
    void whileTap
    return (
      <button {...(htmlProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children as React.ReactNode}</button>
    )
  }

  return {
    motion: {
      div: MotionDiv,
      span: MotionSpan,
      button: MotionButton,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

function timerDefaults(overrides: Partial<ReturnType<typeof mockUseSessionTimer>> = {}) {
  return {
    timeRemaining: 300,
    isRunning: false,
    isPaused: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    formattedTime: '05:00',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseSessionTimer.mockReturnValue(timerDefaults())
})

describe('SessionTimer', () => {
  async function loadComponent() {
    const mod = await import('./SessionTimer')
    return mod.SessionTimer
  }

  it('displays formatted time', async () => {
    mockUseSessionTimer.mockReturnValue(timerDefaults({ timeRemaining: 300, isRunning: true, formattedTime: '05:00' }))
    const SessionTimer = await loadComponent()
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByText('05:00')).toBeDefined()
  })

  it('shows 00:00 when finished', async () => {
    mockUseSessionTimer.mockReturnValue(timerDefaults({ timeRemaining: 0, isRunning: false, formattedTime: '00:00' }))
    const SessionTimer = await loadComponent()
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByText('00:00')).toBeDefined()
  })

  it('renders start button when not running', async () => {
    mockUseSessionTimer.mockReturnValue(timerDefaults({ timeRemaining: 600, isRunning: false, formattedTime: '10:00' }))
    const SessionTimer = await loadComponent()
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByLabelText('Start timer')).toBeDefined()
  })

  it('renders pause button when running', async () => {
    mockUseSessionTimer.mockReturnValue(
      timerDefaults({ timeRemaining: 300, isRunning: true, isPaused: false, formattedTime: '05:00' }),
    )
    const SessionTimer = await loadComponent()
    render(<SessionTimer durationMinutes={10} />)
    expect(screen.getByLabelText('Pause timer')).toBeDefined()
  })
})
