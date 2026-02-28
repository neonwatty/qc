vi.mock('@/components/layout/Header', () => ({
  Header: ({ displayName }: { displayName: string | null }) => <div data-testid="header" data-name={displayName} />,
}))

vi.mock('@/components/layout/Navigation', () => ({
  Navigation: () => <nav data-testid="navigation" />,
}))

vi.mock('@/components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}))

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AppShell', () => {
  async function renderShell(props?: { displayName?: string | null; avatarUrl?: string | null }) {
    const { AppShell } = await import('./app-shell')
    return render(
      <AppShell displayName={props?.displayName ?? 'Alice'} avatarUrl={props?.avatarUrl ?? null}>
        <div data-testid="child-content">Hello</div>
      </AppShell>,
    )
  }

  it('renders children content', async () => {
    await renderShell()
    expect(screen.getByTestId('child-content')).toBeDefined()
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('renders Header component', async () => {
    await renderShell()
    expect(screen.getByTestId('header')).toBeDefined()
  })

  it('renders Navigation component', async () => {
    await renderShell()
    expect(screen.getByTestId('navigation')).toBeDefined()
  })

  it('renders Footer component', async () => {
    await renderShell()
    expect(screen.getByTestId('footer')).toBeDefined()
  })

  it('passes displayName to Header', async () => {
    await renderShell({ displayName: 'Bob' })
    const header = screen.getByTestId('header')
    expect(header.getAttribute('data-name')).toBe('Bob')
  })
})
