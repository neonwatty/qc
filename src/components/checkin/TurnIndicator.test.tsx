import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

const mockSwitchTurn = vi.fn()
const mockExtendTurn = vi.fn()

vi.mock('@/hooks/useTurnState', () => ({
  useTurnState: vi.fn(() => ({
    currentTurn: 'user' as const,
    switchTurn: mockSwitchTurn,
    formattedTurnTime: '2:00',
    turnTimeRemaining: 120,
    isActive: true,
    extendTurn: mockExtendTurn,
    extensionsUsed: 0,
    maxExtensions: 2,
  })),
}))

vi.mock('@/contexts/SessionSettingsContext', () => ({
  useSessionSettings: vi.fn(() => ({
    getActiveSettings: () => ({
      turnBasedMode: true,
      turnDuration: 120,
      allowExtensions: true,
    }),
  })),
}))

vi.mock('@/lib/haptics', () => ({
  hapticFeedback: { tap: vi.fn(), toggle: vi.fn() },
}))

vi.mock('@/lib/animations', () => ({
  SPRING_CONFIGS: { snappy: { type: 'spring', stiffness: 500, damping: 30 } },
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('lucide-react', () => ({
  ArrowRightLeft: () => <span data-testid="icon-arrow" />,
  Plus: () => <span data-testid="icon-plus" />,
  Timer: () => <span data-testid="icon-timer" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

vi.mock('framer-motion', () => {
  function MotionDiv(props: Record<string, unknown>) {
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
  function MotionSpan(props: Record<string, unknown>) {
    const { children, initial, animate, exit, transition, ...rest } = props
    void initial
    void animate
    void exit
    void transition
    return <span {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>{children as React.ReactNode}</span>
  }
  return {
    motion: { div: MotionDiv, span: MotionSpan },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

function defaultTurnState() {
  return {
    currentTurn: 'user' as const,
    switchTurn: mockSwitchTurn,
    formattedTurnTime: '2:00',
    turnTimeRemaining: 120,
    isActive: true,
    extendTurn: mockExtendTurn,
    extensionsUsed: 0,
    maxExtensions: 2,
  }
}

beforeEach(async () => {
  vi.clearAllMocks()
  const { useTurnState } = await import('@/hooks/useTurnState')
  vi.mocked(useTurnState).mockReturnValue(defaultTurnState())
})

describe('TurnIndicator', () => {
  async function loadComponent() {
    const mod = await import('./TurnIndicator')
    return mod.TurnIndicator
  }

  it('returns null when isActive is false', async () => {
    const { useTurnState } = await import('@/hooks/useTurnState')
    vi.mocked(useTurnState).mockReturnValue({
      currentTurn: 'user',
      switchTurn: mockSwitchTurn,
      formattedTurnTime: '2:00',
      turnTimeRemaining: 120,
      isActive: false,
      extendTurn: mockExtendTurn,
      extensionsUsed: 0,
      maxExtensions: 2,
    })
    const TurnIndicator = await loadComponent()
    const { container } = render(<TurnIndicator />)
    expect(container.innerHTML).toBe('')
  })

  it('renders user name initial "Y" for default userName', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator />)
    expect(screen.getByText('Y')).toBeDefined()
  })

  it('renders partner label text "Partner"', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator />)
    expect(screen.getByText('Partner')).toBeDefined()
  })

  it('renders formatted time "2:00"', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator />)
    expect(screen.getByText('2:00')).toBeDefined()
  })

  it('renders "Pass Turn" button', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator />)
    expect(screen.getByText('Pass Turn')).toBeDefined()
  })

  it('renders "+1 min" extend button when allowExtensions is true', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator />)
    expect(screen.getByText('+1 min')).toBeDefined()
  })

  it('calls switchTurn when "Pass Turn" button is clicked', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator />)
    fireEvent.click(screen.getByText('Pass Turn'))
    expect(mockSwitchTurn).toHaveBeenCalledOnce()
  })

  it('renders custom userName initial when provided', async () => {
    const TurnIndicator = await loadComponent()
    render(<TurnIndicator userName="Alice" />)
    expect(screen.getByText('A')).toBeDefined()
  })
})
