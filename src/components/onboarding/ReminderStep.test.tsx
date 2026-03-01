import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ReminderStep', () => {
  async function load() {
    const mod = await import('./ReminderStep')
    return mod.ReminderStep
  }

  it('renders heading and description', async () => {
    const Comp = await load()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('Set Your First Reminder')).toBeDefined()
    expect(screen.getByText('When should we remind you to check in?')).toBeDefined()
  })

  it('renders 7 day buttons', async () => {
    const Comp = await load()
    const { container } = render(
      <Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />,
    )
    const dayGrid = container.querySelector('.grid-cols-7')
    expect(dayGrid).toBeDefined()
    const dayButtons = dayGrid?.querySelectorAll('button')
    expect(dayButtons?.length).toBe(7)
  })

  it('renders 4 time cards', async () => {
    const Comp = await load()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('9:00 AM')).toBeDefined()
    expect(screen.getByText('12:00 PM')).toBeDefined()
    expect(screen.getByText('6:00 PM')).toBeDefined()
    expect(screen.getByText('8:00 PM')).toBeDefined()
  })

  it('calls onUpdate when a day is clicked', async () => {
    const Comp = await load()
    const onUpdate = vi.fn()
    const { container } = render(
      <Comp reminderDay="sunday" reminderTime="20:00" onUpdate={onUpdate} onNext={vi.fn()} onBack={vi.fn()} />,
    )
    // Click the first day button (Monday)
    const dayGrid = container.querySelector('.grid-cols-7')
    const firstDay = dayGrid?.querySelectorAll('button')[0]
    if (firstDay) fireEvent.click(firstDay)
    expect(onUpdate).toHaveBeenCalledWith('monday', '20:00')
  })

  it('calls onUpdate when a time is clicked', async () => {
    const Comp = await load()
    const onUpdate = vi.fn()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={onUpdate} onNext={vi.fn()} onBack={vi.fn()} />)
    fireEvent.click(screen.getByText('9:00 AM'))
    expect(onUpdate).toHaveBeenCalledWith('sunday', '09:00')
  })

  it('calls onNext when Continue is clicked', async () => {
    const Comp = await load()
    const onNext = vi.fn()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={onNext} onBack={vi.fn()} />)
    fireEvent.click(screen.getByText('Continue'))
    expect(onNext).toHaveBeenCalled()
  })

  it('calls onBack when Back is clicked', async () => {
    const Comp = await load()
    const onBack = vi.fn()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={vi.fn()} onBack={onBack} />)
    fireEvent.click(screen.getByText('Back'))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows preview when Preview button is clicked', async () => {
    const Comp = await load()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    fireEvent.click(screen.getByText('Preview'))
    expect(screen.getByText('Reminder Preview')).toBeDefined()
    expect(screen.getByText(/Every Sun at 8:00 PM/)).toBeDefined()
  })

  it('shows helper text about Settings', async () => {
    const Comp = await load()
    render(<Comp reminderDay="sunday" reminderTime="20:00" onUpdate={vi.fn()} onNext={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/You can add more reminders/)).toBeDefined()
  })
})
