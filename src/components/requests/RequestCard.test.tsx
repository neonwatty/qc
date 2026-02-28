import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <span {...props}>{children}</span>
  ),
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children as React.ReactNode}</button>
  ),
}))
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
}))
vi.mock('lucide-react', () => {
  const icon = ({ className }: { className?: string }) => <span className={className} />
  return {
    Heart: icon,
    Briefcase: icon,
    MessageSquare: icon,
    Bell: icon,
    Sparkles: icon,
    MoreHorizontal: icon,
    Clock: icon,
    Check: icon,
    X: icon,
    RefreshCw: icon,
    AlertCircle: icon,
  }
})

import { render, screen, fireEvent } from '@testing-library/react'
import type { DbRequest } from '@/types/database'

const { RequestCard } = await import('./RequestCard')

function makeRequest(overrides: Partial<DbRequest> = {}): DbRequest {
  return {
    id: 'r1',
    couple_id: 'c1',
    requested_by: 'u1',
    requested_for: 'u2',
    title: 'Date night',
    description: null,
    category: 'activity',
    priority: 'medium',
    status: 'pending',
    suggested_date: null,
    converted_to_reminder_id: null,
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

const defaultProps = {
  request: makeRequest(),
  isReceiver: false,
  onRespond: vi.fn(),
  onDelete: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RequestCard', () => {
  it('renders request title', () => {
    render(<RequestCard {...defaultProps} />)
    expect(screen.getByText('Date night')).toBeDefined()
  })

  it('shows status and priority badges', () => {
    render(<RequestCard {...defaultProps} request={makeRequest({ status: 'accepted', priority: 'high' })} />)
    expect(screen.getByText('accepted')).toBeDefined()
    expect(screen.getByText('high')).toBeDefined()
  })

  it('shows description when provided', () => {
    render(<RequestCard {...defaultProps} request={makeRequest({ description: 'Lets go somewhere nice' })} />)
    expect(screen.getByText('Lets go somewhere nice')).toBeDefined()
  })

  it('shows category label', () => {
    render(<RequestCard {...defaultProps} request={makeRequest({ category: 'activity' })} />)
    expect(screen.getByText('Activity')).toBeDefined()
  })

  it('shows Accept/Decline buttons for receiver with pending status', () => {
    render(<RequestCard {...defaultProps} isReceiver request={makeRequest({ status: 'pending' })} />)
    expect(screen.getByText('Accept')).toBeDefined()
    expect(screen.getByText('Decline')).toBeDefined()
  })

  it('hides Accept/Decline buttons when not receiver', () => {
    render(<RequestCard {...defaultProps} isReceiver={false} request={makeRequest({ status: 'pending' })} />)
    expect(screen.queryByText('Accept')).toBeNull()
    expect(screen.queryByText('Decline')).toBeNull()
  })

  it('shows Delete button for sender (not receiver, not converted)', () => {
    render(<RequestCard {...defaultProps} isReceiver={false} request={makeRequest({ status: 'pending' })} />)
    expect(screen.getByText('Delete')).toBeDefined()
  })

  it('shows Convert to Reminder button when accepted and onConvertToReminder provided', () => {
    const onConvert = vi.fn()
    render(
      <RequestCard {...defaultProps} request={makeRequest({ status: 'accepted' })} onConvertToReminder={onConvert} />,
    )
    expect(screen.getByText('Convert to Reminder')).toBeDefined()
    fireEvent.click(screen.getByText('Convert to Reminder'))
    expect(onConvert).toHaveBeenCalledWith('r1')
  })
})
