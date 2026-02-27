const mockToggle = vi.fn()

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => ({ isDark: false, toggle: mockToggle })),
}))

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
  Moon: () => <span data-testid="icon-moon" />,
  Sun: () => <span data-testid="icon-sun" />,
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Header', () => {
  async function renderHeader(props: Record<string, unknown> = {}) {
    const { Header } = await import('./Header')
    return render(<Header {...props} />)
  }

  it('renders "QC" brand text', async () => {
    await renderHeader()
    expect(screen.getByText('QC')).toBeDefined()
  })

  it('renders "Quality Control" text', async () => {
    await renderHeader()
    expect(screen.getByText('Quality Control')).toBeDefined()
  })

  it('shows user initials when no avatarUrl', async () => {
    await renderHeader({ displayName: 'Alice' })
    expect(screen.getByText('A')).toBeDefined()
  })

  it('shows avatar image when avatarUrl provided', async () => {
    await renderHeader({ displayName: 'Alice', avatarUrl: 'https://example.com/pic.jpg' })
    const img = screen.getByRole('img')
    expect(img).toBeDefined()
    expect(img.getAttribute('src')).toBe('https://example.com/pic.jpg')
    expect(img.getAttribute('alt')).toBe('Alice')
  })

  it('shows "?" when no displayName', async () => {
    await renderHeader()
    expect(screen.getByText('?')).toBeDefined()
  })

  it('shows partner initials when partnerName provided', async () => {
    await renderHeader({ displayName: 'Alice', partnerName: 'Bob' })
    expect(screen.getByText('A')).toBeDefined()
    expect(screen.getByText('B')).toBeDefined()
  })

  it('shows theme toggle button with correct aria-label for light mode', async () => {
    await renderHeader()
    const button = screen.getByRole('button', { name: 'Switch to dark mode' })
    expect(button).toBeDefined()
  })

  it('calls toggle when theme button clicked', async () => {
    await renderHeader()
    const button = screen.getByRole('button', { name: 'Switch to dark mode' })
    fireEvent.click(button)
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })
})
