import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockAddDraftNote = vi.fn()
const mockUpdateDraftNote = vi.fn()
const mockUpdateCategoryProgress = vi.fn()

vi.mock('@/contexts/CheckInContext', () => ({
  useCheckInContext: vi.fn(() => ({
    session: {
      id: 's1',
      baseCheckIn: { coupleId: 'c1' },
      draftNotes: [],
    },
    addDraftNote: mockAddDraftNote,
    updateDraftNote: mockUpdateDraftNote,
    updateCategoryProgress: mockUpdateCategoryProgress,
  })),
}))

vi.mock('lucide-react', () => ({
  Lock: () => <span data-testid="icon-lock" />,
  Globe: () => <span data-testid="icon-globe" />,
  Shuffle: () => <span data-testid="icon-shuffle" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

import { DiscussionView } from './DiscussionView'

beforeEach(() => {
  vi.clearAllMocks()
})

function defaultProps() {
  return {
    categoryId: 'cat1',
    categoryName: 'Communication',
    categoryDescription: 'Talk about your day',
    categoryIcon: '💬',
    prompts: ['How are you feeling?', 'What made you smile today?'],
    onComplete: vi.fn(),
  }
}

describe('DiscussionView', () => {
  it('renders category name', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText('Communication')).toBeDefined()
  })

  it('renders category description', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText('Talk about your day')).toBeDefined()
  })

  it('renders category icon', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText('💬')).toBeDefined()
  })

  it('renders first prompt', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText(/How are you feeling/)).toBeDefined()
  })

  it('renders shuffle button when multiple prompts', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByLabelText('Next prompt')).toBeDefined()
  })

  it('does not render shuffle button with single prompt', () => {
    render(<DiscussionView {...defaultProps()} prompts={['Only one']} />)
    expect(screen.queryByLabelText('Next prompt')).toBeNull()
  })

  it('does not render prompt card when no prompts', () => {
    render(<DiscussionView {...defaultProps()} prompts={[]} />)
    expect(screen.queryByText(/How are you feeling/)).toBeNull()
  })

  it('shuffles to next prompt on click', () => {
    render(<DiscussionView {...defaultProps()} />)
    fireEvent.click(screen.getByLabelText('Next prompt'))
    expect(screen.getByText(/What made you smile today/)).toBeDefined()
  })

  it('renders note tabs', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText('Private Notes')).toBeDefined()
    expect(screen.getByText('Shared Notes')).toBeDefined()
  })

  it('renders shared text input by default', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByPlaceholderText('Share your thoughts with your partner...')).toBeDefined()
  })

  it('switches to private text input on tab change', () => {
    render(<DiscussionView {...defaultProps()} />)
    fireEvent.click(screen.getByText('Private Notes'))
    expect(screen.getByPlaceholderText('Write your private thoughts here...')).toBeDefined()
  })

  it('renders Save Progress button', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText('Save Progress')).toBeDefined()
  })

  it('renders Complete Discussion button', () => {
    render(<DiscussionView {...defaultProps()} />)
    expect(screen.getByText('Complete Discussion')).toBeDefined()
  })

  it('calls onComplete and updateCategoryProgress when completing', async () => {
    const onComplete = vi.fn()
    render(<DiscussionView {...defaultProps()} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Complete Discussion'))
    // Wait for async save
    await vi.waitFor(() => {
      expect(mockUpdateCategoryProgress).toHaveBeenCalledWith('cat1', expect.objectContaining({ isCompleted: true }))
      expect(onComplete).toHaveBeenCalled()
    })
  })

  it('renders default icon when categoryIcon is undefined', () => {
    render(<DiscussionView {...defaultProps()} categoryIcon={undefined} />)
    expect(screen.getByText('💬')).toBeDefined()
  })
})
