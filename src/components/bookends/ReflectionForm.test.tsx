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
  Button: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) => <button {...p}>{children}</button>,
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (p: Record<string, unknown>) => <textarea {...(p as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) => <div {...p}>{children}</div>,
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: (p: Record<string, unknown>) => (
    <input type="checkbox" {...(p as React.InputHTMLAttributes<HTMLInputElement>)} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) => <label {...p}>{children}</label>,
}))

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
  Sparkles: () => <span data-testid="icon-sparkles" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  Share2: () => <span data-testid="icon-share2" />,
  Lock: () => <span data-testid="icon-lock" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
}))

const mockClose = vi.fn()
const mockSave = vi.fn()
const defaultCtx = {
  reflection: null,
  isReflectionModalOpen: true,
  closeReflectionModal: mockClose,
  saveReflection: mockSave,
}

vi.mock('@/contexts/BookendsContext', () => ({
  useBookends: vi.fn(() => ({ ...defaultCtx })),
}))

const { ReflectionForm } = await import('./ReflectionForm')
const { useBookends } = await import('@/contexts/BookendsContext')
type Ctx = ReturnType<typeof useBookends>

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useBookends).mockReturnValue({ ...defaultCtx } as unknown as Ctx)
})

describe('ReflectionForm', () => {
  it('renders nothing visible when isReflectionModalOpen is false', () => {
    vi.mocked(useBookends).mockReturnValue({ ...defaultCtx, isReflectionModalOpen: false } as unknown as Ctx)
    const { container } = render(<ReflectionForm sessionId="s1" />)
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog title "Reflect on Your Session" when open', () => {
    render(<ReflectionForm sessionId="s1" />)
    expect(screen.getByRole('heading', { name: /Reflect on Your Session/ })).toBeDefined()
  })

  it('renders "Skip for Now" button', () => {
    render(<ReflectionForm sessionId="s1" />)
    expect(screen.getByText('Skip for Now')).toBeDefined()
  })

  it('renders "Save Reflection" button disabled when fields empty', () => {
    render(<ReflectionForm sessionId="s1" />)
    const btn = screen.getByText('Save Reflection').closest('button')
    expect(btn).toBeDefined()
    expect(btn?.disabled).toBe(true)
  })

  it('renders feeling picker labels', () => {
    render(<ReflectionForm sessionId="s1" />)
    expect(screen.getAllByText('Struggling').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Neutral').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Great').length).toBeGreaterThanOrEqual(1)
  })

  it('renders gratitude textarea placeholder', () => {
    render(<ReflectionForm sessionId="s1" />)
    expect(screen.getByPlaceholderText('I appreciated how you...')).toBeDefined()
  })

  it('calls closeReflectionModal when "Skip for Now" clicked', () => {
    render(<ReflectionForm sessionId="s1" />)
    fireEvent.click(screen.getByText('Skip for Now'))
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it('renders "Reflection Saved!" when reflection is not null', () => {
    const reflection = {
      id: 'r1',
      sessionId: 's1',
      authorId: 'u1',
      feelingBefore: 3,
      feelingAfter: 4,
      gratitude: 'Thanks',
      keyTakeaway: 'Great session',
      shareWithPartner: true,
      createdAt: '2025-01-01T00:00:00Z',
    }
    vi.mocked(useBookends).mockReturnValue({ ...defaultCtx, reflection } as unknown as Ctx)
    render(<ReflectionForm sessionId="s1" />)
    expect(screen.getByText('Reflection Saved!')).toBeDefined()
  })
})
