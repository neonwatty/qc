import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

const mockSingle = vi.fn().mockResolvedValue({ data: { settings: {} }, error: null })
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mockFrom }),
}))

vi.mock('@/app/(app)/settings/actions', () => ({
  updateCoupleSettings: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <label {...props}>{children}</label>
  ),
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked?: boolean
    onCheckedChange?: (v: boolean) => void
    id?: string
  }) => <button role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} {...props} />,
}))

vi.mock('lucide-react', () => ({
  Lock: () => <span data-testid="icon-lock" />,
  Eye: () => <span data-testid="icon-eye" />,
}))

const { PrivacySettings } = await import('./PrivacySettings')

beforeEach(() => {
  vi.clearAllMocks()
  mockSingle.mockResolvedValue({ data: { settings: {} }, error: null })
})

describe('PrivacySettings', () => {
  it('renders "Privacy Settings" heading', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByText('Privacy Settings')).toBeDefined()
  })

  it('renders subtext "Control what you share with your partner"', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByText('Control what you share with your partner')).toBeDefined()
  })

  it('renders "Private by Default" label', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByText('Private by Default')).toBeDefined()
  })

  it('renders "Share Progress" label', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByText('Share Progress')).toBeDefined()
  })

  it('renders description for Private by Default', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByText('New notes and love languages start as private')).toBeDefined()
  })

  it('renders description for Share Progress', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByText('Show milestones and check-in stats with your partner')).toBeDefined()
  })

  it('renders two switch elements', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(2)
  })

  it('renders Lock and Eye icons', async () => {
    render(<PrivacySettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())
    expect(screen.getByTestId('icon-lock')).toBeDefined()
    expect(screen.getByTestId('icon-eye')).toBeDefined()
  })
})
