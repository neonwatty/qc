import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

const mockSingle = vi.fn().mockResolvedValue({
  data: { settings: { emailNotifications: true, quietHoursEnabled: false } },
  error: null,
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ single: mockSingle }) }) }),
  }),
}))

const mockUpdateCoupleSettings = vi.fn().mockResolvedValue({ error: null })

vi.mock('@/app/(app)/settings/actions', () => ({
  updateCoupleSettings: (...args: unknown[]) => mockUpdateCoupleSettings(...args),
}))

const { NotificationSettings } = await import('./NotificationSettings')

beforeEach(() => {
  vi.clearAllMocks()
  mockSingle.mockResolvedValue({
    data: { settings: { emailNotifications: true, quietHoursEnabled: false } },
    error: null,
  })
})

describe('NotificationSettings', () => {
  it('renders notification headings and labels', async () => {
    render(<NotificationSettings coupleId="c1" />)
    expect(screen.getByText('Notification Settings')).toBeDefined()
    expect(screen.getByText('Check-in Reminders')).toBeDefined()
    expect(screen.getByText('Partner Check-ins')).toBeDefined()
    expect(screen.getByText('Milestone Celebrations')).toBeDefined()
    expect(screen.getByText('Action Item Reminders')).toBeDefined()
    expect(screen.getByText('Weekly Summaries')).toBeDefined()
    expect(screen.getByText('Quiet Hours')).toBeDefined()
  })

  it('loads settings from database on mount', async () => {
    render(<NotificationSettings coupleId="c1" />)
    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalled()
    })
  })

  it('defaults check-in reminders to true when not explicitly set', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { settings: {} },
      error: null,
    })
    render(<NotificationSettings coupleId="c1" />)
    await waitFor(() => {
      expect(mockSingle).toHaveBeenCalled()
    })
    const reminderSwitch = screen.getByRole('switch', { name: /check-in reminders/i })
    expect(reminderSwitch.getAttribute('data-state')).toBe('checked')
  })

  it('calls updateCoupleSettings when check-in reminders toggle is clicked', async () => {
    render(<NotificationSettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())

    const reminderSwitch = screen.getByRole('switch', { name: /check-in reminders/i })
    fireEvent.click(reminderSwitch)

    await waitFor(() => {
      expect(mockUpdateCoupleSettings).toHaveBeenCalledWith('emailNotifications', false)
    })
  })

  it('handles load error gracefully', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<NotificationSettings coupleId="c1" />)
    await waitFor(() => expect(mockSingle).toHaveBeenCalled())

    // Should not crash -- component still renders
    expect(screen.getByText('Notification Settings')).toBeDefined()
  })
})
