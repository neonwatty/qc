import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('lucide-react', () => ({
  Lock: () => <span data-testid="icon-lock" />,
  Globe: () => <span data-testid="icon-globe" />,
}))

import { NoteTabs } from './NoteTabs'

describe('NoteTabs', () => {
  it('renders both tab buttons', () => {
    render(<NoteTabs activeTab="private" onTabChange={vi.fn()} hasPrivateContent={false} hasSharedContent={false} />)
    expect(screen.getByText('Private Notes')).toBeDefined()
    expect(screen.getByText('Shared Notes')).toBeDefined()
  })

  it('marks active tab with aria-selected', () => {
    render(<NoteTabs activeTab="shared" onTabChange={vi.fn()} hasPrivateContent={false} hasSharedContent={false} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0].getAttribute('aria-selected')).toBe('false')
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
  })

  it('calls onTabChange when clicking a tab', () => {
    const onTabChange = vi.fn()
    render(
      <NoteTabs activeTab="private" onTabChange={onTabChange} hasPrivateContent={false} hasSharedContent={false} />,
    )
    fireEvent.click(screen.getByText('Shared Notes'))
    expect(onTabChange).toHaveBeenCalledWith('shared')
  })

  it('shows dot indicator when tab has content', () => {
    const { container } = render(
      <NoteTabs activeTab="private" onTabChange={vi.fn()} hasPrivateContent hasSharedContent={false} />,
    )
    const dots = container.querySelectorAll('.rounded-full.bg-primary')
    expect(dots.length).toBe(1)
  })

  it('shows no dots when both empty', () => {
    const { container } = render(
      <NoteTabs activeTab="private" onTabChange={vi.fn()} hasPrivateContent={false} hasSharedContent={false} />,
    )
    const dots = container.querySelectorAll('.rounded-full.bg-primary')
    expect(dots.length).toBe(0)
  })

  it('renders lock icon for private tab', () => {
    render(<NoteTabs activeTab="private" onTabChange={vi.fn()} hasPrivateContent={false} hasSharedContent={false} />)
    expect(screen.getByTestId('icon-lock')).toBeDefined()
  })

  it('renders globe icon for shared tab', () => {
    render(<NoteTabs activeTab="private" onTabChange={vi.fn()} hasPrivateContent={false} hasSharedContent={false} />)
    expect(screen.getByTestId('icon-globe')).toBeDefined()
  })
})
