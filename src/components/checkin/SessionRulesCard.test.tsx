import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import type { SessionSettings } from '@/types'

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

  return {
    motion: {
      div: MotionDiv,
    },
  }
})

vi.mock('lucide-react', () => ({
  Clock: ({ className }: { className?: string }) => <span data-testid="clock-icon" className={className} />,
  Pause: ({ className }: { className?: string }) => <span data-testid="pause-icon" className={className} />,
  Users: ({ className }: { className?: string }) => <span data-testid="users-icon" className={className} />,
  Coffee: ({ className }: { className?: string }) => <span data-testid="coffee-icon" className={className} />,
  Sparkles: ({ className }: { className?: string }) => <span data-testid="sparkles-icon" className={className} />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeSettings(overrides: Partial<SessionSettings> = {}): SessionSettings {
  return {
    id: 'settings-1',
    coupleId: 'couple-1',
    sessionDuration: 30,
    timeoutsPerPartner: 2,
    timeoutDuration: 5,
    turnBasedMode: false,
    turnDuration: 60,
    allowExtensions: false,
    warmUpQuestions: false,
    coolDownTime: 0,
    pauseNotifications: false,
    autoSaveDrafts: false,
    version: 1,
    agreedBy: [],
    ...overrides,
  }
}

describe('SessionRulesCard', () => {
  async function loadComponent() {
    const mod = await import('./SessionRulesCard')
    return mod.SessionRulesCard
  }

  it('renders "Active Session Rules" title in default mode', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings()} />)
    expect(screen.getByText('Active Session Rules')).toBeDefined()
  })

  it('displays formatted duration for values under 60 minutes', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ sessionDuration: 30 })} />)
    expect(screen.getByText('30 min')).toBeDefined()
  })

  it('displays formatted duration for exactly 60 minutes', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ sessionDuration: 60 })} />)
    expect(screen.getByText('1h')).toBeDefined()
  })

  it('displays formatted duration for values over 60 minutes', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ sessionDuration: 90 })} />)
    expect(screen.getByText('1h 30min')).toBeDefined()
  })

  it('shows timeout info when timeoutsPerPartner > 0', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ timeoutsPerPartner: 2, timeoutDuration: 5 })} />)
    expect(screen.getByText('Timeouts')).toBeDefined()
    expect(screen.getByText('2 per partner (5 min each)')).toBeDefined()
  })

  it('hides timeout info when timeoutsPerPartner is 0', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ timeoutsPerPartner: 0 })} />)
    expect(screen.queryByText('Timeouts')).toBeNull()
  })

  it('shows turn-based mode info when enabled', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ turnBasedMode: true, turnDuration: 60 })} />)
    expect(screen.getByText('Turn-based Mode')).toBeDefined()
    expect(screen.getByText('60s per turn')).toBeDefined()
  })

  it('shows warm-up section when warmUpQuestions is true', async () => {
    const SessionRulesCard = await loadComponent()
    render(<SessionRulesCard settings={makeSettings({ warmUpQuestions: true })} />)
    expect(screen.getByText('Warm-up')).toBeDefined()
    expect(screen.getByText('Ice-breaker questions')).toBeDefined()
  })

  it('renders badges in compact mode with turn-based text', async () => {
    const SessionRulesCard = await loadComponent()
    render(
      <SessionRulesCard
        settings={makeSettings({ turnBasedMode: true, warmUpQuestions: true, coolDownTime: 5 })}
        compact
      />,
    )
    expect(screen.queryByText('Active Session Rules')).toBeNull()
    expect(screen.getByText('Turn-based')).toBeDefined()
    expect(screen.getByText('Warm-up')).toBeDefined()
    expect(screen.getByText('Cool-down')).toBeDefined()
  })
})
