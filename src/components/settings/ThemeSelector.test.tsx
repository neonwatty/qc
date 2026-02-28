import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockSetTheme = vi.fn()

vi.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    isDark: false,
    toggle: vi.fn(),
  }),
}))

const { ThemeSelector } = await import('./ThemeSelector')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ThemeSelector', () => {
  it('renders heading and description', () => {
    render(<ThemeSelector />)
    expect(screen.getByText('Appearance')).toBeDefined()
    expect(screen.getByText('Choose how QC looks for you.')).toBeDefined()
  })

  it('renders Light and Dark buttons', () => {
    render(<ThemeSelector />)
    expect(screen.getByText('Light')).toBeDefined()
    expect(screen.getByText('Dark')).toBeDefined()
  })

  it('calls setTheme when clicking Dark', () => {
    render(<ThemeSelector />)
    fireEvent.click(screen.getByText('Dark'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme when clicking Light', () => {
    render(<ThemeSelector />)
    fireEvent.click(screen.getByText('Light'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
