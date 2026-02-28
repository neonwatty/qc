import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

const mockCompleteStep = vi.fn()
const mockGoToStep = vi.fn()
const mockAbandonCheckIn = vi.fn()
const mockUpdateCategoryProgress = vi.fn()
const mockCompleteCheckIn = vi.fn()
const mockAddActionItem = vi.fn()
const mockRemoveActionItem = vi.fn()
const mockToggleActionItem = vi.fn()
const mockOpenReflectionModal = vi.fn()

vi.mock('@/contexts/CheckInContext', () => ({
  useCheckInContext: vi.fn(() => ({
    session: {
      selectedCategories: [],
      categoryProgress: {},
      id: 's1',
      startedAt: new Date().toISOString(),
      baseCheckIn: { coupleId: 'c1', moodBefore: null, moodAfter: null },
      draftNotes: [],
    },
    completeStep: mockCompleteStep,
    goToStep: mockGoToStep,
    abandonCheckIn: mockAbandonCheckIn,
    updateCategoryProgress: mockUpdateCategoryProgress,
    coupleId: 'c1',
    completeCheckIn: mockCompleteCheckIn,
    getCurrentCategoryProgress: vi.fn(() => ({ categoryId: 'cat1', isCompleted: false })),
    addActionItem: mockAddActionItem,
    removeActionItem: mockRemoveActionItem,
    toggleActionItem: mockToggleActionItem,
    actionItems: [],
  })),
}))
vi.mock('@/contexts/BookendsContext', () => ({
  useBookends: vi.fn(() => ({ openReflectionModal: mockOpenReflectionModal })),
}))
vi.mock('@/contexts/SessionSettingsContext', () => ({
  useSessionSettings: vi.fn(() => ({ getActiveSettings: () => ({ sessionDuration: 30 }) })),
}))
vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [{ id: 'cat1', name: 'Communication', description: 'Talk more', icon: '💬', sortOrder: 0 }],
  })),
}))
vi.mock('next/navigation', () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }))
vi.mock('@/components/ui/motion', () => ({
  MotionBox: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))
vi.mock('lucide-react', () => ({ Sparkles: () => <span data-testid="icon-sparkles" /> }))
vi.mock('@/components/bookends/ReflectionForm', () => ({
  ReflectionForm: () => <div data-testid="reflection-form" />,
}))
vi.mock('@/components/checkin/CategoryGrid', () => ({
  CategoryGrid: () => <div data-testid="category-grid" />,
}))
vi.mock('@/components/checkin/NavigationControls', () => ({
  NavigationControls: () => <div data-testid="nav-controls" />,
}))
vi.mock('@/components/checkin/ActionItems', () => ({
  ActionItems: () => <div data-testid="action-items" />,
}))
vi.mock('@/components/checkin/CompletionCelebration', () => ({
  CompletionCelebration: () => <div data-testid="completion-celebration" />,
}))
vi.mock('@/components/checkin/SessionTimer', () => ({
  SessionTimer: () => <div data-testid="session-timer" />,
}))
vi.mock('@/components/checkin/TurnIndicator', () => ({
  TurnIndicator: () => <div data-testid="turn-indicator" />,
}))
vi.mock('@/components/checkin/WarmUpStep', () => ({
  WarmUpStep: () => <div data-testid="warm-up-step" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CategorySelectionStep', () => {
  async function load() {
    const mod = await import('./steps')
    return mod.CategorySelectionStep
  }

  it('renders CategoryGrid', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByTestId('category-grid')).toBeDefined()
  })

  it('renders NavigationControls', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByTestId('nav-controls')).toBeDefined()
  })
})

describe('CategoryDiscussionStep', () => {
  async function load() {
    const mod = await import('./steps')
    return mod.CategoryDiscussionStep
  }

  it('renders SessionTimer', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByTestId('session-timer')).toBeDefined()
  })

  it('renders TurnIndicator', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByTestId('turn-indicator')).toBeDefined()
  })

  it('renders category name from mock', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByText('Communication')).toBeDefined()
  })
})

describe('ReflectionStep', () => {
  async function load() {
    const mod = await import('./steps')
    return mod.ReflectionStep
  }

  it('renders Reflection heading', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByText('Reflection')).toBeDefined()
  })

  it('renders Write a Reflection button', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByText('Write a Reflection')).toBeDefined()
  })

  it('renders ReflectionForm', async () => {
    const Comp = await load()
    render(<Comp />)
    expect(screen.getByTestId('reflection-form')).toBeDefined()
  })
})

describe('ActionItemsStep', () => {
  it('renders ActionItems component', async () => {
    const mod = await import('./steps')
    const Comp = mod.ActionItemsStep
    render(<Comp />)
    expect(screen.getByTestId('action-items')).toBeDefined()
  })
})

describe('CompletionStep', () => {
  it('renders CompletionCelebration', async () => {
    const mod = await import('./steps')
    const Comp = mod.CompletionStep
    render(<Comp />)
    expect(screen.getByTestId('completion-celebration')).toBeDefined()
  })
})
