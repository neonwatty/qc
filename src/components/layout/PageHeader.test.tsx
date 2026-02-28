const mockBack = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ back: mockBack })),
}))

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...rest }: Record<string, unknown>) => (
    <button {...(rest as Record<string, unknown>)}>{children as React.ReactNode}</button>
  ),
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PageHeader', () => {
  async function renderPageHeader(props: Record<string, unknown> = {}) {
    const { PageHeader } = await import('./PageHeader')
    return render(<PageHeader title="Test Title" {...props} />)
  }

  it('renders title as h1', async () => {
    await renderPageHeader()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeDefined()
    expect(heading.textContent).toBe('Test Title')
  })

  it('renders description when provided', async () => {
    await renderPageHeader({ description: 'A helpful description' })
    expect(screen.getByText('A helpful description')).toBeDefined()
  })

  it('does not render description when not provided', async () => {
    const { container } = await renderPageHeader()
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('shows back button by default', async () => {
    await renderPageHeader()
    expect(screen.getByTestId('icon-arrow-left')).toBeDefined()
  })

  it('hides back button when showBack is false', async () => {
    await renderPageHeader({ showBack: false })
    expect(screen.queryByTestId('icon-arrow-left')).toBeNull()
  })

  it('back button calls router.back() when clicked', async () => {
    await renderPageHeader()
    const button = screen.getByTestId('icon-arrow-left').closest('button')!
    fireEvent.click(button)
    expect(mockBack).toHaveBeenCalledTimes(1)
  })

  it('renders header element', async () => {
    await renderPageHeader()
    expect(screen.getByRole('banner')).toBeDefined()
  })
})
