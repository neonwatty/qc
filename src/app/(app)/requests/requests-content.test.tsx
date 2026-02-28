import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return { ...actual, useActionState: vi.fn(() => [{}, vi.fn(), false]) }
})
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('lucide-react', () => ({
  Inbox: () => <span data-testid="icon-inbox" />,
  Send: () => <span data-testid="icon-send" />,
}))
vi.mock('@/hooks/useRealtimeCouple', () => ({ useRealtimeCouple: vi.fn() }))
vi.mock('@/components/requests/RequestCard', () => ({
  RequestCard: (props: Record<string, unknown>) => (
    <div data-testid={`request-${(props.request as { id: string }).id}`} />
  ),
}))
vi.mock('@/components/requests/RequestForm', () => ({
  RequestForm: () => <div data-testid="request-form" />,
}))
vi.mock('@/components/layout/PageContainer', () => ({
  PageContainer: ({ children, title, action }: Record<string, unknown>) => (
    <div>
      <h1>{title as string}</h1>
      {action as React.ReactNode}
      {children as React.ReactNode}
    </div>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))
vi.mock('./actions', () => ({
  createRequest: vi.fn(),
  deleteRequest: vi.fn(),
  respondToRequest: vi.fn(),
  convertRequestToReminder: vi.fn(),
}))

import { render, screen } from '@testing-library/react'
import type { DbRequest } from '@/types/database'

const { RequestsContent } = await import('./requests-content')

function makeRequest(overrides: Partial<DbRequest> = {}): DbRequest {
  return {
    id: 'req1',
    couple_id: 'c1',
    requested_by: 'p1',
    requested_for: 'u1',
    title: 'Date night',
    description: null,
    category: 'date-night',
    priority: 'medium',
    status: 'pending',
    suggested_date: null,
    created_at: '2025-01-01T00:00:00Z',
    converted_to_reminder_id: null,
    ...overrides,
  }
}

const defaultProps = {
  initialRequests: [] as DbRequest[],
  userId: 'u1',
  coupleId: 'c1',
  partnerId: 'p1',
  partnerName: 'Alex',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RequestsContent', () => {
  it('renders "Requests" title', () => {
    render(<RequestsContent {...defaultProps} />)
    expect(screen.getByText('Requests')).toBeDefined()
  })

  it('renders "New Request" button', () => {
    render(<RequestsContent {...defaultProps} />)
    expect(screen.getByText('New Request')).toBeDefined()
  })

  it('shows empty state when no requests', () => {
    render(<RequestsContent {...defaultProps} />)
    expect(screen.getByText('No received requests yet.')).toBeDefined()
  })

  it('renders received/sent tabs', () => {
    render(<RequestsContent {...defaultProps} />)
    expect(screen.getByText(/^received/)).toBeDefined()
    expect(screen.getByText(/^sent/)).toBeDefined()
  })

  it('renders received tab count', () => {
    const requests = [makeRequest({ id: 'r1' }), makeRequest({ id: 'r2' })]
    render(<RequestsContent {...defaultProps} initialRequests={requests} />)
    expect(screen.getByText('received (2)')).toBeDefined()
  })

  it('shows request cards for received requests', () => {
    const requests = [makeRequest({ id: 'r1' }), makeRequest({ id: 'r2' })]
    render(<RequestsContent {...defaultProps} initialRequests={requests} />)
    expect(screen.getByTestId('request-r1')).toBeDefined()
    expect(screen.getByTestId('request-r2')).toBeDefined()
  })

  it('disables "New Request" when no partnerId', () => {
    render(<RequestsContent {...defaultProps} partnerId={null} />)
    const btn = screen.getByText('New Request')
    expect(btn.closest('button')?.disabled).toBe(true)
  })

  it('shows "Connect with a partner" text when no partnerId', () => {
    render(<RequestsContent {...defaultProps} partnerId={null} />)
    expect(screen.getByText('Connect with a partner to send requests')).toBeDefined()
  })
})
