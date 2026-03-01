import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const EMPTY_PREFS = { communicationStyle: '', checkInFrequency: '', sessionStyle: '' }

describe('QuizStep', () => {
  async function load() {
    const mod = await import('./QuizStep')
    return mod.QuizStep
  }

  it('renders quiz heading and first question', async () => {
    const Comp = await load()
    render(<Comp preferences={EMPTY_PREFS} updatePreferences={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Quick Relationship Quiz')).toBeDefined()
    expect(screen.getByText('How do you prefer to discuss important topics?')).toBeDefined()
  })

  it('renders 4 options for the first question', async () => {
    const Comp = await load()
    render(<Comp preferences={EMPTY_PREFS} updatePreferences={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Face-to-face')).toBeDefined()
    expect(screen.getByText('Written notes')).toBeDefined()
    expect(screen.getByText('During activities')).toBeDefined()
    expect(screen.getByText('Mix of all')).toBeDefined()
  })

  it('calls updatePreferences when an option is clicked', async () => {
    const Comp = await load()
    const updatePreferences = vi.fn()
    render(<Comp preferences={EMPTY_PREFS} updatePreferences={updatePreferences} onNext={vi.fn()} onBack={vi.fn()} />)
    fireEvent.click(screen.getByText('Face-to-face'))
    expect(updatePreferences).toHaveBeenCalledWith({ communicationStyle: 'face-to-face' })
  })

  it('disables Continue until all 3 questions are answered', async () => {
    const Comp = await load()
    render(<Comp preferences={EMPTY_PREFS} updatePreferences={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    const continueBtn = screen.getByText('Continue').closest('button')
    expect(continueBtn?.disabled).toBe(true)
  })

  it('enables Continue when all preferences are set', async () => {
    const Comp = await load()
    const fullPrefs = { communicationStyle: 'mix', checkInFrequency: 'weekly', sessionStyle: 'standard' }
    render(<Comp preferences={fullPrefs} updatePreferences={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    const continueBtn = screen.getByText('Continue').closest('button')
    expect(continueBtn?.disabled).toBe(false)
  })

  it('calls onBack when Back button is clicked', async () => {
    const Comp = await load()
    const onBack = vi.fn()
    render(<Comp preferences={EMPTY_PREFS} updatePreferences={vi.fn()} onNext={vi.fn()} onBack={onBack} />)
    fireEvent.click(screen.getByText('Back'))
    expect(onBack).toHaveBeenCalled()
  })

  it('calls onNext when Continue is clicked with full preferences', async () => {
    const Comp = await load()
    const onNext = vi.fn()
    const fullPrefs = { communicationStyle: 'mix', checkInFrequency: 'weekly', sessionStyle: 'standard' }
    render(<Comp preferences={fullPrefs} updatePreferences={vi.fn()} onNext={onNext} onBack={vi.fn()} />)
    fireEvent.click(screen.getByText('Continue'))
    expect(onNext).toHaveBeenCalled()
  })

  it('renders 3 progress segments', async () => {
    const Comp = await load()
    const { container } = render(
      <Comp preferences={EMPTY_PREFS} updatePreferences={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />,
    )
    const segments = container.querySelectorAll('.h-2.w-12')
    expect(segments.length).toBe(3)
  })
})
