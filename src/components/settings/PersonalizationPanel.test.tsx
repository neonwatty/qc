import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/app/(app)/settings/actions/personalization', () => ({
  updatePersonalization: vi.fn().mockResolvedValue({ error: null }),
}))

const { PersonalizationPanel } = await import('./PersonalizationPanel')

const defaultProps = {
  coupleId: 'c1',
  currentSettings: {},
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PersonalizationPanel', () => {
  it('renders heading', () => {
    render(<PersonalizationPanel {...defaultProps} />)
    expect(screen.getByText('Personalization')).toBeDefined()
  })

  it('renders 6 color preset buttons', () => {
    render(<PersonalizationPanel {...defaultProps} />)
    expect(screen.getByLabelText('Pink')).toBeDefined()
    expect(screen.getByLabelText('Blue')).toBeDefined()
    expect(screen.getByLabelText('Green')).toBeDefined()
    expect(screen.getByLabelText('Purple')).toBeDefined()
    expect(screen.getByLabelText('Orange')).toBeDefined()
    expect(screen.getByLabelText('Teal')).toBeDefined()
  })

  it('renders font size buttons', () => {
    render(<PersonalizationPanel {...defaultProps} />)
    expect(screen.getByText('Small')).toBeDefined()
    expect(screen.getByText('Medium')).toBeDefined()
    expect(screen.getByText('Large')).toBeDefined()
  })

  it('renders accessibility toggles', () => {
    render(<PersonalizationPanel {...defaultProps} />)
    expect(screen.getByText('High Contrast')).toBeDefined()
    expect(screen.getByText('Reduce Motion')).toBeDefined()
  })

  it('renders reset button', () => {
    render(<PersonalizationPanel {...defaultProps} />)
    expect(screen.getByText('Reset to Defaults')).toBeDefined()
  })

  it('uses current settings as initial values', () => {
    render(
      <PersonalizationPanel
        coupleId="c1"
        currentSettings={{ primaryColor: 'blue', fontSize: 'large', highContrast: true }}
      />,
    )
    const highContrastCheckbox = screen.getByRole('checkbox', { name: /high contrast/i })
    expect((highContrastCheckbox as HTMLInputElement).checked).toBe(true)
  })

  it('calls updatePersonalization on color change', async () => {
    render(<PersonalizationPanel {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Blue'))
    const { updatePersonalization } = await import('@/app/(app)/settings/actions/personalization')
    expect(updatePersonalization).toHaveBeenCalledWith({ primaryColor: 'blue' })
  })

  it('calls updatePersonalization on font size change', async () => {
    render(<PersonalizationPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('Large'))
    const { updatePersonalization } = await import('@/app/(app)/settings/actions/personalization')
    expect(updatePersonalization).toHaveBeenCalledWith({ fontSize: 'large' })
  })

  it('calls updatePersonalization on reset', async () => {
    render(<PersonalizationPanel {...defaultProps} />)
    fireEvent.click(screen.getByText('Reset to Defaults'))
    const { updatePersonalization } = await import('@/app/(app)/settings/actions/personalization')
    expect(updatePersonalization).toHaveBeenCalledWith({
      primaryColor: 'pink',
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
    })
  })
})
