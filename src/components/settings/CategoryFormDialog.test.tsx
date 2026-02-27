import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Category } from '@/types'

import { CategoryFormDialog } from './CategoryFormDialog'

const defaultFormData = { name: 'Test', description: 'Desc', icon: '💬' }

const mockCategory: Category = {
  id: 'cat-1',
  coupleId: 'couple-1',
  name: 'Existing',
  description: 'An existing category',
  icon: '🌱',
  isActive: true,
  isSystem: false,
  sortOrder: 1,
  createdAt: '2025-01-01',
}

type DialogProps = Parameters<typeof CategoryFormDialog>[0]
let onOpenChange: DialogProps['onOpenChange'] & ReturnType<typeof vi.fn>
let onFormDataChange: DialogProps['onFormDataChange'] & ReturnType<typeof vi.fn>
let onSubmit: DialogProps['onSubmit'] & ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  onOpenChange = vi.fn() as typeof onOpenChange
  onFormDataChange = vi.fn() as typeof onFormDataChange
  onSubmit = vi.fn() as typeof onSubmit
})

function renderDialog(overrides: Partial<Parameters<typeof CategoryFormDialog>[0]> = {}) {
  return render(
    <CategoryFormDialog
      isOpen={true}
      onOpenChange={onOpenChange}
      editingCategory={null}
      formData={defaultFormData}
      onFormDataChange={onFormDataChange}
      onSubmit={onSubmit}
      {...overrides}
    />,
  )
}

describe('CategoryFormDialog', () => {
  it('shows "Create Category" title when editingCategory is null', () => {
    renderDialog({ editingCategory: null })
    expect(screen.getByRole('heading', { name: 'Create Category' })).toBeDefined()
  })

  it('shows "Edit Category" title when editingCategory is provided', () => {
    renderDialog({ editingCategory: mockCategory })
    expect(screen.getByText('Edit Category')).toBeDefined()
  })

  it('renders name, description, icon inputs with correct values', () => {
    renderDialog({ formData: { name: 'My Cat', description: 'My Desc', icon: '🎉' } })
    expect(screen.getByLabelText('Name')).toHaveValue('My Cat')
    expect(screen.getByLabelText('Description (optional)')).toHaveValue('My Desc')
    expect(screen.getByLabelText('Icon')).toHaveValue('🎉')
  })

  it('calls onFormDataChange with updated name when name input changes', () => {
    renderDialog()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } })
    expect(onFormDataChange).toHaveBeenCalledWith({
      ...defaultFormData,
      name: 'New Name',
    })
  })

  it('calls onSubmit when button is clicked', () => {
    renderDialog()
    fireEvent.click(screen.getByRole('button', { name: 'Create Category' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows "Save Changes" button text when editing', () => {
    renderDialog({ editingCategory: mockCategory })
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDefined()
  })

  it('shows "Create Category" button text when creating', () => {
    renderDialog({ editingCategory: null })
    expect(screen.getByRole('button', { name: 'Create Category' })).toBeDefined()
  })
})
