import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => {
      const { initial, animate, exit, transition, ...htmlProps } = props as Record<string, unknown>
      void initial
      void animate
      void exit
      void transition
      return <div {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="icon-chevron-left" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Check: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  Loader2: () => <span data-testid="icon-loader" />,
  ArrowRight: () => <span data-testid="icon-arrow-right" />,
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NavigationControls', () => {
  async function loadComponent() {
    const mod = await import('./NavigationControls')
    return mod.NavigationControls
  }

  const defaultProps = {
    currentStep: 'category-discussion' as const,
  }

  it('renders Back and Next buttons in default variant', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} />)
    expect(screen.getByText('Back')).toBeDefined()
    expect(screen.getByText('Next')).toBeDefined()
  })

  it('calls onBack when Back button clicked', async () => {
    const NavigationControls = await loadComponent()
    const onBack = vi.fn()
    render(<NavigationControls {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByText('Back'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onNext when Next button clicked', async () => {
    const NavigationControls = await loadComponent()
    const onNext = vi.fn()
    render(<NavigationControls {...defaultProps} onNext={onNext} />)
    fireEvent.click(screen.getByText('Next'))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('disables Back button when canGoBack=false', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} canGoBack={false} />)
    const backButton = screen.getByText('Back').closest('button')
    expect(backButton?.disabled).toBe(true)
  })

  it('disables Next button when canGoNext=false', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} canGoNext={false} />)
    const nextButton = screen.getByText('Next').closest('button')
    expect(nextButton?.disabled).toBe(true)
  })

  it('shows Processing with loader when isLoading=true', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} isLoading />)
    expect(screen.getByText('Processing')).toBeDefined()
    expect(screen.getByTestId('icon-loader')).toBeDefined()
  })

  it('shows custom nextLabel and backLabel', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} nextLabel="Save" backLabel="Previous" />)
    expect(screen.getByText('Save')).toBeDefined()
    expect(screen.getByText('Previous')).toBeDefined()
  })

  it('shows step progress when showProgress with index and total', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} showProgress currentStepIndex={1} totalSteps={5} />)
    expect(screen.getByText('Step 2 of 5')).toBeDefined()
  })

  it('renders both buttons in mobile variant', async () => {
    const NavigationControls = await loadComponent()
    render(<NavigationControls {...defaultProps} variant="mobile" />)
    expect(screen.getByText('Back')).toBeDefined()
    expect(screen.getByText('Next')).toBeDefined()
  })
})
