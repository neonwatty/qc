import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart" />,
  Plus: () => <span data-testid="icon-plus" />,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  CardContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardDescription: ({ children }: React.PropsWithChildren) => <p>{children}</p>,
  CardHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  CardTitle: ({ children }: React.PropsWithChildren) => <h3>{children}</h3>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => <div role="progressbar" aria-valuenow={value} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}))

const { LoveLanguagesWidget } = await import('./LoveLanguagesWidget')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoveLanguagesWidget', () => {
  it('shows "Love Languages" heading', () => {
    render(<LoveLanguagesWidget />)
    expect(screen.getByText('Love Languages')).toBeDefined()
  })

  it('shows stats for totalLanguages, sharedLanguages, completedThisWeek', () => {
    render(<LoveLanguagesWidget totalLanguages={5} sharedLanguages={3} completedThisWeek={2} />)
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })

  it('shows sharing progress bar when totalLanguages > 0', () => {
    render(<LoveLanguagesWidget totalLanguages={5} sharedLanguages={3} />)
    expect(screen.getByText('Sharing Progress')).toBeDefined()
    expect(screen.getByRole('progressbar')).toBeDefined()
  })

  it('calculates sharing percent correctly', () => {
    render(<LoveLanguagesWidget totalLanguages={5} sharedLanguages={3} />)
    expect(screen.getByText('60%')).toBeDefined()
  })

  it('hides progress bar when totalLanguages is 0', () => {
    render(<LoveLanguagesWidget totalLanguages={0} />)
    expect(screen.queryByText('Sharing Progress')).toBeNull()
  })

  it('shows "Top Shared" section with language tags', () => {
    const topLanguages = [
      { title: 'Words of Affirmation', category: 'verbal' },
      { title: 'Quality Time', category: 'time' },
    ]
    render(<LoveLanguagesWidget totalLanguages={2} topLanguages={topLanguages} />)
    expect(screen.getByText('Top Shared')).toBeDefined()
    expect(screen.getByText('Words of Affirmation')).toBeDefined()
    expect(screen.getByText('Quality Time')).toBeDefined()
  })

  it('shows empty state when totalLanguages is 0', () => {
    render(<LoveLanguagesWidget totalLanguages={0} />)
    expect(screen.getByText('No love languages added yet')).toBeDefined()
    expect(screen.getByText('Add Language')).toBeDefined()
  })

  it('shows "View All" button', () => {
    render(<LoveLanguagesWidget />)
    expect(screen.getByText('View All')).toBeDefined()
  })
})
