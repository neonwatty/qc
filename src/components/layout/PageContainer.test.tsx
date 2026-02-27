import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { PageContainer } = await import('./PageContainer')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PageContainer', () => {
  it('renders children', () => {
    render(<PageContainer>Hello world</PageContainer>)
    expect(screen.getByText('Hello world')).toBeDefined()
  })

  it('renders title as h1 when provided', () => {
    render(<PageContainer title="My Page">Content</PageContainer>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeDefined()
    expect(heading.textContent).toBe('My Page')
  })

  it('does not render h1 when title is not provided', () => {
    render(<PageContainer>Content</PageContainer>)
    const heading = screen.queryByRole('heading', { level: 1 })
    expect(heading).toBeNull()
  })

  it('renders description when title and description provided', () => {
    render(
      <PageContainer title="Page" description="A helpful description">
        Content
      </PageContainer>,
    )
    expect(screen.getByText('A helpful description')).toBeDefined()
  })

  it('does not render description when only title provided', () => {
    const { container } = render(<PageContainer title="Page">Content</PageContainer>)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('renders action slot when title and action provided', () => {
    render(
      <PageContainer title="Page" action={<button>Click me</button>}>
        Content
      </PageContainer>,
    )
    expect(screen.getByText('Click me')).toBeDefined()
  })

  it('passes className to content wrapper div', () => {
    const { container } = render(<PageContainer className="custom-gap">Content</PageContainer>)
    const wrapper = container.querySelector('.custom-gap')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.textContent).toBe('Content')
  })
})
