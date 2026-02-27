import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { ErrorBoundary } from './ErrorBoundary'

// Suppress console.error from ErrorBoundary.componentDidCatch and React error boundaries
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

function ThrowingChild({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('Test error')
  return <div>Child content</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('renders default error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Try Again')).toBeDefined()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom error')).toBeDefined()
    expect(screen.queryByText('Something went wrong')).toBeNull()
  })

  it('resets error state when Try Again is clicked', () => {
    let shouldThrow = true
    function ConditionalThrow() {
      if (shouldThrow) throw new Error('Test error')
      return <div>Recovered</div>
    }

    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()

    shouldThrow = false
    fireEvent.click(screen.getByText('Try Again'))

    expect(screen.getByText('Recovered')).toBeDefined()
  })

  it('logs error via console.error', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    )
    expect(console.error).toHaveBeenCalled()
  })
})
