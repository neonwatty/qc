'use client'

import React from 'react'

import { cn } from '@/lib/utils'
import { TouchButton } from '@/components/ui/TouchButton'
import { MobileSheet } from '@/components/ui/MobileSheet'
import type { MobileSheetProps } from '@/components/ui/MobileSheet'

interface SheetHeaderProps {
  className?: string
  children: React.ReactNode
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ className, children }) => (
  <div className={cn('px-6 py-4 border-b border-border', className)}>{children}</div>
)

export const SheetTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-foreground', className)} {...props}>
    {children}
  </h3>
)

export const SheetDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props}>
    {children}
  </p>
)

export const SheetContent: React.FC<SheetHeaderProps> = ({ className, children }) => (
  <div className={cn('px-6 py-4', className)}>{children}</div>
)

export const SheetFooter: React.FC<SheetHeaderProps> = ({ className, children }) => (
  <div className={cn('px-6 py-4 border-t border-border', className)}>{children}</div>
)

const BottomSheet: React.FC<Omit<MobileSheetProps, 'side'>> = (props) => <MobileSheet side="bottom" {...props} />

interface ActionSheetProps extends Omit<MobileSheetProps, 'children' | 'side'> {
  actions: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
  }>
  title?: string
  description?: string
}

const ActionSheet: React.FC<ActionSheetProps> = ({ actions, title, description, ...props }) => (
  <BottomSheet size="sm" showHandle={false} {...props}>
    {(title || description) && (
      <SheetHeader>
        {title && <SheetTitle>{title}</SheetTitle>}
        {description && <SheetDescription>{description}</SheetDescription>}
      </SheetHeader>
    )}
    <SheetContent className="pb-6">
      <div className="space-y-2">
        {actions.map((action, index) => (
          <TouchButton
            key={index}
            variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
            size="lg"
            className="w-full justify-start h-12"
            onClick={() => {
              action.onClick()
              props.onClose()
            }}
            disabled={action.disabled}
            leftIcon={action.icon}
          >
            {action.label}
          </TouchButton>
        ))}
      </div>
    </SheetContent>
  </BottomSheet>
)

export { BottomSheet, ActionSheet }
