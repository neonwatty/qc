import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockExportUserData = vi.fn()
const mockToast = { error: vi.fn(), success: vi.fn() }

vi.mock('sonner', () => ({ toast: mockToast }))
vi.mock('@/app/(app)/settings/actions', () => ({
  exportUserData: (...args: unknown[]) => mockExportUserData(...args),
}))
vi.mock('lucide-react', () => ({
  Download: () => <span data-testid="download-icon" />,
}))

const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
const mockRevokeObjectURL = vi.fn()
globalThis.URL.createObjectURL = mockCreateObjectURL
globalThis.URL.revokeObjectURL = mockRevokeObjectURL

const { DataExportPanel } = await import('./DataExportPanel')

beforeEach(() => {
  vi.clearAllMocks()
  mockCreateObjectURL.mockReturnValue('blob:test-url')
})

describe('DataExportPanel', () => {
  it('renders heading and export button', () => {
    render(<DataExportPanel />)
    expect(screen.getByText('Data & Privacy')).toBeDefined()
    expect(screen.getByText('Export Data')).toBeDefined()
  })

  it('shows "Exporting..." while export is in progress', async () => {
    let resolveExport!: (value: { data: null; error: null }) => void
    mockExportUserData.mockReturnValue(
      new Promise((resolve) => {
        resolveExport = resolve
      }),
    )

    render(<DataExportPanel />)
    fireEvent.click(screen.getByText('Export Data'))

    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeDefined()
    })

    resolveExport({ data: null, error: null })
  })

  it('creates blob, triggers download link click, and shows success toast on success', async () => {
    const mockData = { notes: [], checkIns: [] }
    mockExportUserData.mockResolvedValue({ data: mockData, error: null })

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag)
      if (tag === 'a') {
        el.click = clickSpy
      }
      return el
    })

    render(<DataExportPanel />)
    fireEvent.click(screen.getByText('Export Data'))

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })

    expect(clickSpy).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
    expect(mockToast.success).toHaveBeenCalledWith('Data exported successfully')

    vi.restoreAllMocks()
  })

  it('shows error toast when result has error', async () => {
    mockExportUserData.mockResolvedValue({ error: 'Export failed', data: null })

    render(<DataExportPanel />)
    fireEvent.click(screen.getByText('Export Data'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Export failed')
    })
  })

  it('shows generic error toast on exception', async () => {
    mockExportUserData.mockRejectedValue(new Error('Network error'))

    render(<DataExportPanel />)
    fireEvent.click(screen.getByText('Export Data'))

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to export data')
    })
  })

  it('disables button during export', async () => {
    let resolveExport!: (value: { data: null; error: null }) => void
    mockExportUserData.mockReturnValue(
      new Promise((resolve) => {
        resolveExport = resolve
      }),
    )

    render(<DataExportPanel />)
    const button = screen.getByRole('button', { name: /export data/i })
    expect(button).not.toBeDisabled()

    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /exporting/i })).toBeDisabled()
    })

    resolveExport({ data: null, error: null })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export data/i })).not.toBeDisabled()
    })
  })
})
