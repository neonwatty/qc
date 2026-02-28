import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/lib/utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}))

vi.mock('./PhotoUpload', () => ({
  PhotoUpload: () => <div data-testid="photo-upload" />,
}))

vi.mock('./milestone-creator-config', () => ({
  CATEGORY_OPTIONS: [
    { id: 'communication', name: 'Communication', icon: '\u{1F4AC}', color: '', bgColor: '', description: '' },
    { id: 'intimacy', name: 'Intimacy', icon: '\u2764\uFE0F', color: '', bgColor: '', description: '' },
    { id: 'growth', name: 'Growth', icon: '\u{1F331}', color: '', bgColor: '', description: '' },
    { id: 'relationship', name: 'Relationship', icon: '\u{1F389}', color: '', bgColor: '', description: '' },
    { id: 'adventure', name: 'Adventure', icon: '\u2B50', color: '', bgColor: '', description: '' },
    { id: 'milestone', name: 'Milestone', icon: '\u{1F3AF}', color: '', bgColor: '', description: '' },
    { id: 'custom', name: 'Custom', icon: '\u2728', color: '', bgColor: '', description: '' },
  ],
  RARITY_OPTIONS: [
    { id: 'common', name: 'Common', icon: '\u26AA' },
    { id: 'rare', name: 'Rare', icon: '\u{1F535}' },
    { id: 'epic', name: 'Epic', icon: '\u{1F7E3}' },
    { id: 'legendary', name: 'Legendary', icon: '\u{1F7E1}' },
  ],
}))

const { MilestoneCreatorForm } = await import('./MilestoneCreatorForm')

const defaultFormData = {
  title: '',
  description: '',
  category: '' as const,
  icon: '',
  photoFile: null,
  rarity: 'common' as const,
  points: 10,
}

function defaultProps(overrides: Record<string, unknown> = {}) {
  return {
    formData: defaultFormData,
    errors: {} as Record<string, string>,
    isSubmitting: false,
    onUpdateField: vi.fn(),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MilestoneCreatorForm', () => {
  it('renders Title label and input', () => {
    render(<MilestoneCreatorForm {...defaultProps()} />)
    expect(screen.getByText('Title')).toBeDefined()
    expect(screen.getByPlaceholderText('e.g., First Month of Check-ins')).toBeDefined()
  })

  it('renders Description label and textarea', () => {
    render(<MilestoneCreatorForm {...defaultProps()} />)
    expect(screen.getByText('Description')).toBeDefined()
    expect(screen.getByPlaceholderText('Describe this milestone...')).toBeDefined()
  })

  it('renders all 7 category options by name', () => {
    render(<MilestoneCreatorForm {...defaultProps()} />)
    for (const name of ['Communication', 'Intimacy', 'Growth', 'Relationship', 'Adventure', 'Milestone', 'Custom']) {
      expect(screen.getByText(name)).toBeDefined()
    }
  })

  it('renders all 4 rarity options by name', () => {
    render(<MilestoneCreatorForm {...defaultProps()} />)
    for (const name of ['Common', 'Rare', 'Epic', 'Legendary']) {
      expect(screen.getByText(name)).toBeDefined()
    }
  })

  it('shows Create Milestone button when not submitting', () => {
    render(<MilestoneCreatorForm {...defaultProps()} />)
    expect(screen.getByText('Create Milestone')).toBeDefined()
  })

  it('shows Creating... button text when isSubmitting is true', () => {
    render(<MilestoneCreatorForm {...defaultProps({ isSubmitting: true })} />)
    expect(screen.getByText('Creating...')).toBeDefined()
    expect(screen.queryByText('Create Milestone')).toBeNull()
  })

  it('shows error message when errors.title is set', () => {
    render(<MilestoneCreatorForm {...defaultProps({ errors: { title: 'Title is required' } })} />)
    expect(screen.getByText('Title is required')).toBeDefined()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<MilestoneCreatorForm {...defaultProps({ onClose })} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
