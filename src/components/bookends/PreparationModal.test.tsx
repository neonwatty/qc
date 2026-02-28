import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

function MotionComponent(props: Record<string, unknown>) {
  const { children, initial, animate, exit, transition, whileHover, whileTap, layout, style, variants, ...rest } = props
  void initial
  void animate
  void exit
  void transition
  void whileHover
  void whileTap
  void layout
  void variants
  return (
    <div style={style as React.CSSProperties | undefined} {...(rest as React.HTMLAttributes<HTMLDivElement>)}>
      {children as React.ReactNode}
    </div>
  )
}

vi.mock('framer-motion', () => ({
  motion: { div: MotionComponent, button: MotionComponent },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: React.PropsWithChildren<{ open?: boolean }>) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <h2>{children}</h2>,
  DialogDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => <input {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
}))

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  Plus: () => <span data-testid="icon-plus" />,
  GripVertical: () => <span data-testid="icon-grip" />,
  Users: () => <span data-testid="icon-users" />,
  Clock: () => <span data-testid="icon-clock" />,
}))

const mockClosePreparationModal = vi.fn()
const mockAddMyTopic = vi.fn()
const mockRemoveMyTopic = vi.fn()

vi.mock('@/contexts/BookendsContext', () => ({
  useBookends: vi.fn(() => ({
    preparation: { myTopics: [], partnerTopics: [] },
    isPreparationModalOpen: true,
    closePreparationModal: mockClosePreparationModal,
    addMyTopic: mockAddMyTopic,
    removeMyTopic: mockRemoveMyTopic,
  })),
}))

const { PreparationModal } = await import('./PreparationModal')
const { useBookends } = await import('@/contexts/BookendsContext')

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useBookends).mockReturnValue({
    preparation: { myTopics: [], partnerTopics: [] },
    isPreparationModalOpen: true,
    closePreparationModal: mockClosePreparationModal,
    addMyTopic: mockAddMyTopic,
    removeMyTopic: mockRemoveMyTopic,
  } as unknown as ReturnType<typeof useBookends>)
})

describe('PreparationModal', () => {
  it('renders nothing visible when isPreparationModalOpen is false', () => {
    vi.mocked(useBookends).mockReturnValue({
      preparation: { myTopics: [], partnerTopics: [] },
      isPreparationModalOpen: false,
      closePreparationModal: mockClosePreparationModal,
      addMyTopic: mockAddMyTopic,
      removeMyTopic: mockRemoveMyTopic,
    } as unknown as ReturnType<typeof useBookends>)
    const { container } = render(<PreparationModal />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog title "Prepare for Your Check-In" when open', () => {
    render(<PreparationModal />)
    expect(screen.getByRole('heading', { name: /Prepare for Your Check-In/ })).toBeDefined()
  })

  it('renders all 6 quick topic buttons', () => {
    render(<PreparationModal />)
    expect(screen.getByText('Weekly wins & challenges')).toBeDefined()
    expect(screen.getByText('Emotional check-in')).toBeDefined()
    expect(screen.getByText('Upcoming plans')).toBeDefined()
    expect(screen.getByText('Appreciation moment')).toBeDefined()
    expect(screen.getByText('Something on my mind')).toBeDefined()
    expect(screen.getByText('Our shared goals')).toBeDefined()
  })

  it('renders custom topic input placeholder', () => {
    render(<PreparationModal />)
    expect(screen.getByPlaceholderText('Something specific you want to discuss...')).toBeDefined()
  })

  it('renders "Save for Later" button', () => {
    render(<PreparationModal />)
    expect(screen.getByText('Save for Later')).toBeDefined()
  })

  it('renders "Start Check-In with Topics" button disabled when no topics', () => {
    render(<PreparationModal />)
    const btn = screen.getByText('Start Check-In with Topics').closest('button')
    expect(btn).toBeDefined()
    expect(btn?.disabled).toBe(true)
  })

  it('calls closePreparationModal when "Save for Later" clicked', () => {
    render(<PreparationModal />)
    fireEvent.click(screen.getByText('Save for Later'))
    expect(mockClosePreparationModal).toHaveBeenCalledTimes(1)
  })

  it('renders "No topics from your partner yet" when no partner topics', () => {
    render(<PreparationModal />)
    expect(screen.getByText('No topics from your partner yet')).toBeDefined()
  })
})
