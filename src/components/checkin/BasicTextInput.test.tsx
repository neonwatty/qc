import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

import { BasicTextInput } from './BasicTextInput'

beforeEach(() => {
  vi.useFakeTimers()
})

describe('BasicTextInput', () => {
  it('renders textarea with placeholder', () => {
    render(<BasicTextInput value="" onChange={vi.fn()} placeholder="Write here..." />)
    expect(screen.getByPlaceholderText('Write here...')).toBeDefined()
  })

  it('renders label when provided', () => {
    render(<BasicTextInput value="" onChange={vi.fn()} label="Notes" />)
    expect(screen.getByText('Notes')).toBeDefined()
  })

  it('renders helper text', () => {
    render(<BasicTextInput value="" onChange={vi.fn()} helperText="Only you can see this" />)
    expect(screen.getByText('Only you can see this')).toBeDefined()
  })

  it('shows character count', () => {
    render(<BasicTextInput value="hello" onChange={vi.fn()} maxLength={100} />)
    expect(screen.getByText('5 / 100')).toBeDefined()
  })

  it('calls onChange on input', () => {
    const onChange = vi.fn()
    render(<BasicTextInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('triggers auto-save after delay', () => {
    const onSave = vi.fn()
    render(<BasicTextInput value="test" onChange={vi.fn()} onSave={onSave} autoSave autoSaveDelay={1000} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onSave).toHaveBeenCalledOnce()
  })

  it('shows "Saved" indicator after auto-save', () => {
    const onSave = vi.fn()
    render(<BasicTextInput value="test" onChange={vi.fn()} onSave={onSave} autoSave autoSaveDelay={1000} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('Saved')).toBeDefined()
  })

  it('does not auto-save when autoSave is false', () => {
    const onSave = vi.fn()
    render(<BasicTextInput value="test" onChange={vi.fn()} onSave={onSave} autoSave={false} />)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onSave).not.toHaveBeenCalled()
  })

  it('does not auto-save empty value', () => {
    const onSave = vi.fn()
    render(<BasicTextInput value="" onChange={vi.fn()} onSave={onSave} autoSave autoSaveDelay={1000} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onSave).not.toHaveBeenCalled()
  })

  it('uses default maxLength of 2000', () => {
    render(<BasicTextInput value="" onChange={vi.fn()} />)
    expect(screen.getByText('0 / 2000')).toBeDefined()
  })
})
