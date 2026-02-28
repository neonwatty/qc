import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, className, style, ...rest }: Record<string, unknown>) => {
      const htmlProps: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(rest)) {
        if (key.startsWith('on') && key[2] && key[2] === key[2].toUpperCase()) htmlProps[key] = val
      }
      return (
        <div
          onClick={onClick as React.MouseEventHandler}
          className={className as string}
          style={style as React.CSSProperties}
          {...htmlProps}
        >
          {children as React.ReactNode}
        </div>
      )
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@/lib/utils', () => ({ cn: (...args: unknown[]) => args.filter(Boolean).join(' ') }))
vi.mock('@/lib/haptics', () => ({ hapticFeedback: { longPress: vi.fn() } }))
vi.mock('@/components/ui/MobileSheetParts', () => ({
  ActionSheet: ({
    open,
    actions,
    title,
  }: {
    open: boolean
    actions: Array<{ id: string; label: string }>
    title?: string
  }) =>
    open ? (
      <div data-testid="action-sheet" data-title={title}>
        {actions.map((a) => (
          <button key={a.id}>{a.label}</button>
        ))}
      </div>
    ) : null,
}))

const { LongPressMenu } = await import('./LongPressMenu')
const { hapticFeedback } = await import('@/lib/haptics')

const defaultActions = [
  { id: 'edit', label: 'Edit', onClick: vi.fn() },
  { id: 'delete', label: 'Delete', variant: 'destructive' as const, onClick: vi.fn() },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LongPressMenu', () => {
  it('renders children', () => {
    render(
      <LongPressMenu actions={defaultActions}>
        <span>Child</span>
      </LongPressMenu>,
    )
    expect(screen.getByText('Child')).toBeDefined()
  })

  it('does not show action sheet by default', () => {
    render(
      <LongPressMenu actions={defaultActions}>
        <span>Child</span>
      </LongPressMenu>,
    )
    expect(screen.queryByTestId('action-sheet')).toBeNull()
  })

  it('shows action sheet on context menu (right-click)', () => {
    render(
      <LongPressMenu actions={defaultActions}>
        <span>Child</span>
      </LongPressMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Child').parentElement!)
    expect(screen.getByTestId('action-sheet')).toBeDefined()
  })

  it('renders action labels in the action sheet', () => {
    render(
      <LongPressMenu actions={defaultActions}>
        <span>Child</span>
      </LongPressMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Child').parentElement!)
    expect(screen.getByText('Edit')).toBeDefined()
    expect(screen.getByText('Delete')).toBeDefined()
  })

  it('does not trigger long press when disabled', () => {
    render(
      <LongPressMenu actions={defaultActions} disabled>
        <span>Child</span>
      </LongPressMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Child').parentElement!)
    expect(screen.queryByTestId('action-sheet')).toBeNull()
  })

  it('renders with custom className', () => {
    render(
      <LongPressMenu actions={defaultActions} className="custom-cls">
        <span>Child</span>
      </LongPressMenu>,
    )
    const wrapper = screen.getByText('Child').parentElement!
    expect(wrapper.className).toContain('custom-cls')
  })

  it('action sheet has title prop', () => {
    render(
      <LongPressMenu actions={defaultActions} title="My Title">
        <span>Child</span>
      </LongPressMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Child').parentElement!)
    expect(screen.getByTestId('action-sheet').getAttribute('data-title')).toBe('My Title')
  })

  it('calls hapticFeedback.longPress on context menu', () => {
    render(
      <LongPressMenu actions={defaultActions}>
        <span>Child</span>
      </LongPressMenu>,
    )
    fireEvent.contextMenu(screen.getByText('Child').parentElement!)
    expect(hapticFeedback.longPress).toHaveBeenCalledTimes(1)
  })
})
