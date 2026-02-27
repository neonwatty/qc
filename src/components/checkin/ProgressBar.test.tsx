import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import type { CheckInProgress, CheckInStep } from '@/types/checkin'

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
  Check: () => <span data-testid="check-icon" />,
  Circle: () => <span data-testid="circle-icon" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProgressBar', () => {
  async function loadComponent() {
    const mod = await import('./ProgressBar')
    return mod.ProgressBar
  }

  function makeProgress(overrides: Partial<CheckInProgress> = {}): CheckInProgress {
    return {
      currentStep: 'welcome',
      completedSteps: [],
      totalSteps: 6,
      percentage: 0,
      ...overrides,
    }
  }

  it('renders progress percentage text', async () => {
    const ProgressBar = await loadComponent()
    render(<ProgressBar progress={makeProgress({ percentage: 45 })} currentStep="category-discussion" />)
    expect(screen.getByText('45%')).toBeDefined()
  })

  it('shows step labels by default', async () => {
    const ProgressBar = await loadComponent()
    render(<ProgressBar progress={makeProgress({ percentage: 0 })} currentStep="welcome" />)
    expect(screen.getByText('Welcome')).toBeDefined()
    expect(screen.getByText('Discussion')).toBeDefined()
    expect(screen.getByText('Reflection')).toBeDefined()
    expect(screen.getByText('Complete')).toBeDefined()
  })

  it('hides labels when showLabels=false', async () => {
    const ProgressBar = await loadComponent()
    render(<ProgressBar progress={makeProgress({ percentage: 0 })} currentStep="welcome" showLabels={false} />)
    expect(screen.queryByText('Welcome')).toBeNull()
    expect(screen.queryByText('Discussion')).toBeNull()
  })

  it('completed steps show check icon', async () => {
    const ProgressBar = await loadComponent()
    const completedSteps: CheckInStep[] = ['welcome', 'category-selection']
    render(
      <ProgressBar progress={makeProgress({ completedSteps, percentage: 33 })} currentStep="category-discussion" />,
    )
    const checkIcons = screen.getAllByTestId('check-icon')
    expect(checkIcons).toHaveLength(2)
  })

  it('current step shows pulsing dot (motion.div)', async () => {
    const ProgressBar = await loadComponent()
    const completedSteps: CheckInStep[] = ['welcome', 'category-selection']
    render(
      <ProgressBar progress={makeProgress({ completedSteps, percentage: 33 })} currentStep="category-discussion" />,
    )
    // The current step renders a motion.div (mocked as div) with bg-purple-600 class
    // It should not have a check-icon or circle-icon — there should be 2 checks + 3 circles
    const checkIcons = screen.getAllByTestId('check-icon')
    const circleIcons = screen.getAllByTestId('circle-icon')
    expect(checkIcons).toHaveLength(2)
    expect(circleIcons).toHaveLength(3)
  })

  it('pending steps show circle icon', async () => {
    const ProgressBar = await loadComponent()
    render(<ProgressBar progress={makeProgress({ completedSteps: [], percentage: 0 })} currentStep="welcome" />)
    // welcome is current (pulsing dot), remaining 5 are pending (circle)
    const circleIcons = screen.getAllByTestId('circle-icon')
    expect(circleIcons).toHaveLength(5)
  })

  it('renders all 6 steps', async () => {
    const ProgressBar = await loadComponent()
    const { container } = render(<ProgressBar progress={makeProgress({ percentage: 0 })} currentStep="welcome" />)
    // 1 current (pulsing dot) + 5 pending (circle icons) = 6 step indicators
    const checkIcons = screen.queryAllByTestId('check-icon')
    const circleIcons = screen.queryAllByTestId('circle-icon')
    // Total step indicators: checks + circles + 1 current (motion.div pulsing dot)
    const totalSteps = checkIcons.length + circleIcons.length + 1
    expect(totalSteps).toBe(6)
  })
})
